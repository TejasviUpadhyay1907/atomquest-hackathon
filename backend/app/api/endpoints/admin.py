from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User
from app.models.goal import Goal, GoalStatus
from app.schemas.goal import GoalResponse, SharedGoalCreate
from app.services.audit_service import AuditService
from app.services.notification_service import NotificationService
from app.services.email_service import EmailService

router = APIRouter()
email_service = EmailService()


@router.get("/all-goals", response_model=List[GoalResponse])
def get_all_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all goals in the system"""
    goals = db.query(Goal).all()
    return goals


@router.post("/goals/{goal_id}/unlock", response_model=GoalResponse)
def unlock_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Unlock a locked goal (Admin only)"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    if not goal.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal is not locked"
        )
    
    # Unlock
    goal.is_locked = False
    goal.status = GoalStatus.DRAFT
    
    db.commit()
    db.refresh(goal)
    
    # Log unlock
    AuditService.log_goal_unlock(db, goal.id, current_user.id)
    
    return goal


@router.post("/shared-goals", response_model=dict)
def create_shared_goal(
    shared_goal_data: SharedGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Create a shared goal and assign to multiple employees"""
    # Validate primary owner exists
    primary_owner = db.query(User).filter(User.id == shared_goal_data.primary_owner_id).first()
    if not primary_owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Primary owner not found"
        )
    
    # Create primary goal
    primary_goal = Goal(
        user_id=shared_goal_data.primary_owner_id,
        thrust_area_id=shared_goal_data.thrust_area_id,
        title=shared_goal_data.title,
        description=shared_goal_data.description,
        uom_type=shared_goal_data.uom_type,
        target=shared_goal_data.target,
        weightage=20.0,  # Default weightage, can be adjusted
        status=GoalStatus.APPROVED,
        is_locked=True,
        is_shared=True,
        primary_owner_id=shared_goal_data.primary_owner_id
    )
    
    db.add(primary_goal)
    db.flush()  # Get the ID
    
    # Create linked goals for recipients
    created_goals = []
    for recipient_id in shared_goal_data.recipient_ids:
        # Validate recipient exists
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            continue
        
        # Create linked goal
        linked_goal = Goal(
            user_id=recipient_id,
            thrust_area_id=shared_goal_data.thrust_area_id,
            title=shared_goal_data.title,
            description=shared_goal_data.description,
            uom_type=shared_goal_data.uom_type,
            target=shared_goal_data.target,
            weightage=20.0,  # Default, recipient can adjust
            status=GoalStatus.APPROVED,
            is_locked=False,  # Recipients can adjust weightage
            is_shared=True,
            primary_owner_id=shared_goal_data.primary_owner_id,
            shared_goal_id=primary_goal.id  # Link to primary goal
        )
        
        db.add(linked_goal)
        created_goals.append(linked_goal)
        
        # Send notification
        NotificationService.notify_shared_goal_assigned(
            db, recipient_id, shared_goal_data.title, linked_goal.id
        )
        
        # Send email
        email_service.send_shared_goal_assigned_email(
            recipient.email,
            recipient.full_name,
            shared_goal_data.title
        )
    
    db.commit()
    
    return {
        "message": f"Shared goal created and assigned to {len(created_goals)} employees",
        "primary_goal_id": primary_goal.id,
        "linked_goal_count": len(created_goals)
    }


@router.get("/users", response_model=List[dict])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get all users in the system"""
    users = db.query(User).all()
    
    return [
        {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "department": user.department,
            "manager_id": user.manager_id
        }
        for user in users
    ]


@router.get("/stats", response_model=dict)
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get system-wide statistics"""
    total_users = db.query(User).count()
    total_goals = db.query(Goal).count()
    
    pending_approvals = db.query(Goal).filter(
        Goal.status == GoalStatus.PENDING_APPROVAL
    ).count()
    
    approved_goals = db.query(Goal).filter(
        Goal.status == GoalStatus.APPROVED
    ).count()
    
    draft_goals = db.query(Goal).filter(
        Goal.status == GoalStatus.DRAFT
    ).count()
    
    return {
        "total_users": total_users,
        "total_goals": total_goals,
        "pending_approvals": pending_approvals,
        "approved_goals": approved_goals,
        "draft_goals": draft_goals
    }
