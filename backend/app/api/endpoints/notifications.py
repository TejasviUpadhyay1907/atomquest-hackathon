from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter()


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get notifications for current user - OPTIMIZED"""
    # Optimized query with proper indexing and minimal data transfer
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Use limit early and order by indexed column for faster query
    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    return notifications


@router.get("/unread-count", response_model=dict)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    count = NotificationService.get_unread_count(db, current_user.id)
    
    return {"unread_count": count}


@router.put("/{notification_id}/read", response_model=dict)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    success = NotificationService.mark_as_read(db, notification_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )
    
    return {"message": "Notification marked as read"}


@router.put("/mark-all-read", response_model=dict)
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    NotificationService.mark_all_as_read(db, current_user.id)
    
    return {"message": "All notifications marked as read"}
