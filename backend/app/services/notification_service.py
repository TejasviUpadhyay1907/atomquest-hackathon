from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.user import User
from typing import Optional


class NotificationService:
    """Service for creating and managing notifications"""
    
    @staticmethod
    def create_notification(
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        related_goal_id: Optional[int] = None,
        related_check_in_id: Optional[int] = None
    ) -> Notification:
        """Create a new notification"""
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            related_goal_id=related_goal_id,
            related_check_in_id=related_check_in_id
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @staticmethod
    def notify_goal_submitted(db: Session, employee_id: int, manager_id: int, goal_title: str, goal_id: int):
        """Notify manager when employee submits goals"""
        NotificationService.create_notification(
            db=db,
            user_id=manager_id,
            notification_type="goal_submitted",
            title="New Goal Submission",
            message=f"Employee has submitted goals for approval. Goal: {goal_title}",
            related_goal_id=goal_id
        )
    
    @staticmethod
    def notify_goal_approved(db: Session, employee_id: int, goal_title: str, goal_id: int):
        """Notify employee when goal is approved"""
        NotificationService.create_notification(
            db=db,
            user_id=employee_id,
            notification_type="goal_approved",
            title="Goal Approved",
            message=f"Your goal '{goal_title}' has been approved by your manager.",
            related_goal_id=goal_id
        )
    
    @staticmethod
    def notify_goal_rejected(db: Session, employee_id: int, goal_title: str, goal_id: int, reason: str):
        """Notify employee when goal is rejected"""
        NotificationService.create_notification(
            db=db,
            user_id=employee_id,
            notification_type="goal_rejected",
            title="Goal Returned for Rework",
            message=f"Your goal '{goal_title}' needs revision. Reason: {reason}",
            related_goal_id=goal_id
        )
    
    @staticmethod
    def notify_shared_goal_assigned(db: Session, employee_id: int, goal_title: str, goal_id: int):
        """Notify employee when shared goal is assigned"""
        NotificationService.create_notification(
            db=db,
            user_id=employee_id,
            notification_type="shared_goal_assigned",
            title="Shared Goal Assigned",
            message=f"A departmental goal '{goal_title}' has been assigned to you.",
            related_goal_id=goal_id
        )
    
    @staticmethod
    def notify_check_in_due(db: Session, employee_id: int, quarter: str):
        """Notify employee when check-in is due"""
        NotificationService.create_notification(
            db=db,
            user_id=employee_id,
            notification_type="check_in_due",
            title=f"{quarter} Check-in Due",
            message=f"Please complete your {quarter} quarterly check-in."
        )
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        """Mark notification as read"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            return True
        return False
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: int):
        """Mark all notifications as read for a user"""
        db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Get count of unread notifications"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
