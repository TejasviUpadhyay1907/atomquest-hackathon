from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_manager
from app.models.user import User
from app.models.goal import Goal, GoalStatus
from app.schemas.goal import GoalResponse, GoalUpdate
from app.services.notification_service import NotificationService
from app.services.audit_service import AuditService
from app.services.email_service import EmailService

router = APIRouter()
email_service = EmailService()


@router.get("/team")
def get_team_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Get all team members for the manager"""
    team_members = current_user.team_members
    
    return [
        {
            "id": member.id,
            "email": member.email,
            "full_name": member.full_name,
            "department": member.department,
            "role": str(member.role.value) if hasattr(member.role, 'value') else str(member.role)
        }
        for member in team_members
    ]


@router.get("/team-performance")
def get_team_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Get performance metrics for the team"""
    team_members = current_user.team_members
    
    performance_data = []
    for member in team_members:
        # Get member's goals
        total_goals = db.query(Goal).filter(Goal.user_id == member.id).count()
        approved_goals = db.query(Goal).filter(
            Goal.user_id == member.id,
            Goal.status == GoalStatus.APPROVED
        ).count()
        pending_goals = db.query(Goal).filter(
            Goal.user_id == member.id,
            Goal.status == GoalStatus.PENDING_APPROVAL
        ).count()
        
        performance_data.append({
            "employee_id": member.id,
            "employee_name": member.full_name,
            "total_goals": total_goals,
            "approved_goals": approved_goals,
            "pending_goals": pending_goals,
            "completion_rate": round((approved_goals / total_goals * 100) if total_goals > 0 else 0, 2)
        })
    
    return {
        "team_size": len(team_members),
        "performance": performance_data
    }


@router.get("/pending-approvals", response_model=List[GoalResponse])
def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Get all pending goal approvals for manager's team"""
    # Get all team members
    team_member_ids = [member.id for member in current_user.team_members]
    
    # Get pending goals
    pending_goals = db.query(Goal).filter(
        Goal.user_id.in_(team_member_ids),
        Goal.status == GoalStatus.PENDING_APPROVAL
    ).all()
    
    return pending_goals


@router.get("/team-goals", response_model=List[GoalResponse])
def get_team_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Get all goals for manager's team"""
    team_member_ids = [member.id for member in current_user.team_members]
    
    goals = db.query(Goal).filter(
        Goal.user_id.in_(team_member_ids)
    ).all()
    
    return goals


@router.put("/goals/{goal_id}/inline-edit", response_model=GoalResponse)
def inline_edit_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Manager inline edit during approval (can edit target and weightage)"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Check if manager owns this employee
    if goal.user.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit goals of your team members"
        )
    
    # Only allow editing if pending approval
    if goal.status != GoalStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only edit goals that are pending approval"
        )
    
    # Manager can only edit target and weightage
    allowed_fields = ["target", "weightage"]
    update_data = goal_data.model_dump(exclude_unset=True)
    
    for field in update_data.keys():
        if field not in allowed_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Managers can only edit target and weightage. Cannot edit: {field}"
            )
    
    # Validate weightage if provided
    if "weightage" in update_data:
        if update_data["weightage"] < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Weightage must be at least 10%"
            )
        
        # Check total weightage for employee
        other_goals = db.query(Goal).filter(
            Goal.user_id == goal.user_id,
            Goal.id != goal.id,
            Goal.status != GoalStatus.REJECTED
        ).all()
        
        total = sum(g.weightage for g in other_goals) + update_data["weightage"]
        if total > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Total weightage would be {total}%. Maximum is 100%"
            )
    
    # Apply changes and log
    for field, new_value in update_data.items():
        old_value = getattr(goal, field)
        if old_value != new_value:
            AuditService.log_inline_edit(
                db, goal.id, current_user.id, field, str(old_value), str(new_value)
            )
            setattr(goal, field, new_value)
    
    db.commit()
    db.refresh(goal)
    
    return goal


@router.post("/goals/{goal_id}/approve", response_model=GoalResponse)
def approve_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Approve a goal"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Check if manager owns this employee
    if goal.user.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only approve goals of your team members"
        )
    
    if goal.status != GoalStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal is not pending approval"
        )
    
    # Approve and lock
    goal.status = GoalStatus.APPROVED
    goal.is_locked = True
    goal.approved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(goal)
    
    # Log approval
    AuditService.log_goal_approval(db, goal.id, current_user.id)
    
    # Send notification
    NotificationService.notify_goal_approved(db, goal.user_id, goal.title, goal.id)
    
    # Send email
    employee = goal.user
    email_service.send_goal_approved_email(
        employee.email,
        employee.full_name,
        1  # Single goal approved
    )
    
    return goal


@router.post("/goals/{goal_id}/reject", response_model=GoalResponse)
def reject_goal(
    goal_id: int,
    rejection_reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Reject a goal and return for rework"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Check if manager owns this employee
    if goal.user.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reject goals of your team members"
        )
    
    if goal.status != GoalStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal is not pending approval"
        )
    
    # Reject
    goal.status = GoalStatus.REJECTED
    goal.rejection_reason = rejection_reason
    
    db.commit()
    db.refresh(goal)
    
    # Log rejection
    AuditService.log_goal_rejection(db, goal.id, current_user.id, rejection_reason)
    
    # Send notification
    NotificationService.notify_goal_rejected(db, goal.user_id, goal.title, goal.id, rejection_reason)
    
    # Send email
    employee = goal.user
    email_service.send_goal_rejected_email(
        employee.email,
        employee.full_name,
        goal.title,
        rejection_reason
    )
    
    return goal


@router.post("/approve-all/{employee_id}", response_model=dict)
def approve_all_goals(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Approve all pending goals for an employee"""
    # Check if employee is in manager's team
    employee = db.query(User).filter(User.id == employee_id).first()
    
    if not employee or employee.manager_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee not in your team"
        )
    
    # Get all pending goals
    pending_goals = db.query(Goal).filter(
        Goal.user_id == employee_id,
        Goal.status == GoalStatus.PENDING_APPROVAL
    ).all()
    
    if not pending_goals:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending goals to approve"
        )
    
    # Approve all
    approved_count = 0
    for goal in pending_goals:
        goal.status = GoalStatus.APPROVED
        goal.is_locked = True
        goal.approved_at = datetime.utcnow()
        
        # Log approval
        AuditService.log_goal_approval(db, goal.id, current_user.id)
        
        # Send notification
        NotificationService.notify_goal_approved(db, goal.user_id, goal.title, goal.id)
        
        approved_count += 1
    
    db.commit()
    
    # Send email
    email_service.send_goal_approved_email(
        employee.email,
        employee.full_name,
        approved_count
    )
    
    return {
        "message": f"Approved {approved_count} goals for {employee.full_name}",
        "approved_count": approved_count
    }
