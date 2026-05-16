from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from typing import Optional


class AuditService:
    """Service for logging audit trail"""
    
    @staticmethod
    def log_change(
        db: Session,
        goal_id: int,
        user_id: int,
        action: str,
        field_changed: Optional[str] = None,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None
    ) -> AuditLog:
        """Log a change to audit trail"""
        audit_log = AuditLog(
            goal_id=goal_id,
            user_id=user_id,
            action=action,
            field_changed=field_changed,
            old_value=old_value,
            new_value=new_value
        )
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        return audit_log
    
    @staticmethod
    def log_goal_update(db: Session, goal_id: int, user_id: int, field: str, old_val: str, new_val: str):
        """Log goal field update"""
        return AuditService.log_change(
            db=db,
            goal_id=goal_id,
            user_id=user_id,
            action=f"Updated {field}",
            field_changed=field,
            old_value=str(old_val),
            new_value=str(new_val)
        )
    
    @staticmethod
    def log_goal_approval(db: Session, goal_id: int, user_id: int):
        """Log goal approval"""
        return AuditService.log_change(
            db=db,
            goal_id=goal_id,
            user_id=user_id,
            action="Approved goal"
        )
    
    @staticmethod
    def log_goal_rejection(db: Session, goal_id: int, user_id: int, reason: str):
        """Log goal rejection"""
        return AuditService.log_change(
            db=db,
            goal_id=goal_id,
            user_id=user_id,
            action="Rejected goal",
            field_changed="rejection_reason",
            new_value=reason
        )
    
    @staticmethod
    def log_goal_unlock(db: Session, goal_id: int, user_id: int):
        """Log goal unlock by admin"""
        return AuditService.log_change(
            db=db,
            goal_id=goal_id,
            user_id=user_id,
            action="Unlocked goal (Admin)"
        )
    
    @staticmethod
    def log_inline_edit(db: Session, goal_id: int, user_id: int, field: str, old_val: str, new_val: str):
        """Log manager inline edit during approval"""
        return AuditService.log_change(
            db=db,
            goal_id=goal_id,
            user_id=user_id,
            action=f"Manager edited {field} during approval",
            field_changed=field,
            old_value=str(old_val),
            new_value=str(new_val)
        )
