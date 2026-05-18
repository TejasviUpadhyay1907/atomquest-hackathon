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


@router.get("/audit-logs")
def get_audit_logs(
    goal_id: int = None,
    user_id: int = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get audit logs (Admin only)"""
    from app.models.audit_log import AuditLog
    
    query = db.query(AuditLog)
    
    if goal_id:
        query = query.filter(AuditLog.goal_id == goal_id)
    
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    audit_logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "goal_id": log.goal_id,
            "user_id": log.user_id,
            "action": log.action,
            "field_changed": log.field_changed,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        }
        for log in audit_logs
    ]


@router.post("/escalation/send-reminders", response_model=dict)
def send_escalation_reminders(
    quarter: str = "Q1",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Escalation Module: Send reminder emails to employees/managers who haven't completed actions.
    - Employees with approved goals but no check-in for the quarter
    - Managers with pending approvals older than expected
    """
    from app.models.goal import Goal, GoalStatus
    from app.models.check_in import CheckIn
    
    sent_count = 0
    escalation_log = []

    # 1. Find employees with approved goals but missing check-ins for this quarter
    approved_goals = db.query(Goal).filter(Goal.status == GoalStatus.APPROVED).all()
    
    # Group by employee
    employee_goals = {}
    for goal in approved_goals:
        if goal.user_id not in employee_goals:
            employee_goals[goal.user_id] = []
        employee_goals[goal.user_id].append(goal)
    
    for emp_id, goals in employee_goals.items():
        # Check if employee has check-ins for this quarter
        checkins = db.query(CheckIn).filter(
            CheckIn.goal_id.in_([g.id for g in goals]),
            CheckIn.quarter == quarter
        ).all()
        
        checked_goal_ids = {c.goal_id for c in checkins}
        missing_goals = [g for g in goals if g.id not in checked_goal_ids]
        
        if missing_goals:
            employee = db.query(User).filter(User.id == emp_id).first()
            if employee and employee.email:
                email_service.send_check_in_reminder_email(
                    employee.email,
                    employee.full_name,
                    quarter
                )
                sent_count += 1
                escalation_log.append({
                    "type": "check_in_reminder",
                    "recipient": employee.full_name,
                    "email": employee.email,
                    "reason": f"{len(missing_goals)} goal(s) missing {quarter} check-in"
                })

    # 2. Find managers with pending approvals
    pending_goals = db.query(Goal).filter(Goal.status == GoalStatus.PENDING_APPROVAL).all()
    
    # Group by manager (via employee's manager relationship)
    manager_pending = {}
    for goal in pending_goals:
        employee = db.query(User).filter(User.id == goal.user_id).first()
        if employee and employee.manager_id:
            if employee.manager_id not in manager_pending:
                manager_pending[employee.manager_id] = []
            manager_pending[employee.manager_id].append(goal)
    
    for mgr_id, pending in manager_pending.items():
        manager = db.query(User).filter(User.id == mgr_id).first()
        if manager and manager.email:
            subject = f"Action Required: {len(pending)} goal(s) awaiting your approval"
            html = f"""
            <html><body style="font-family:Arial,sans-serif;color:#333;">
            <div style="max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#667eea;">Pending Approvals Reminder</h2>
                <p>Hi {manager.full_name},</p>
                <p>You have <strong>{len(pending)} goal(s)</strong> awaiting your review and approval.</p>
                <p>Please review and approve or return them for rework to keep the process moving.</p>
                <div style="margin:24px 0;">
                    <a href="https://atomquest-frontend.vercel.app/manager/approvals"
                       style="background:#667eea;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;">
                        Review Approvals
                    </a>
                </div>
                <p style="color:#999;font-size:13px;">AtomQuest Goal Tracking Portal — Escalation Notification</p>
            </div></body></html>
            """
            email_service.send_email(manager.email, subject, html)
            sent_count += 1
            escalation_log.append({
                "type": "approval_reminder",
                "recipient": manager.full_name,
                "email": manager.email,
                "reason": f"{len(pending)} goal(s) pending approval"
            })

    return {
        "message": f"Escalation reminders sent successfully",
        "emails_sent": sent_count,
        "quarter": quarter,
        "escalation_log": escalation_log
    }


@router.get("/escalation/status", response_model=dict)
def get_escalation_status(
    quarter: str = "Q1",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get escalation status — who needs reminders without sending emails"""
    from app.models.goal import Goal, GoalStatus
    from app.models.check_in import CheckIn

    # Employees missing check-ins
    approved_goals = db.query(Goal).filter(Goal.status == GoalStatus.APPROVED).all()
    employee_goals = {}
    for goal in approved_goals:
        if goal.user_id not in employee_goals:
            employee_goals[goal.user_id] = []
        employee_goals[goal.user_id].append(goal)

    missing_checkins = []
    for emp_id, goals in employee_goals.items():
        checkins = db.query(CheckIn).filter(
            CheckIn.goal_id.in_([g.id for g in goals]),
            CheckIn.quarter == quarter
        ).all()
        checked_ids = {c.goal_id for c in checkins}
        missing = [g for g in goals if g.id not in checked_ids]
        if missing:
            emp = db.query(User).filter(User.id == emp_id).first()
            if emp:
                missing_checkins.append({
                    "employee": emp.full_name,
                    "missing_goals": len(missing),
                    "quarter": quarter
                })

    # Managers with pending approvals
    pending_goals = db.query(Goal).filter(Goal.status == GoalStatus.PENDING_APPROVAL).all()
    pending_approvals = len(pending_goals)

    return {
        "quarter": quarter,
        "employees_missing_checkins": len(missing_checkins),
        "missing_checkin_details": missing_checkins,
        "pending_approvals": pending_approvals,
        "total_requiring_action": len(missing_checkins) + (1 if pending_approvals > 0 else 0)
    }
