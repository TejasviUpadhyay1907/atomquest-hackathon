from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    type = Column(String, nullable=False)  # e.g., "goal_submitted", "goal_approved", "check_in_due"
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    
    # Link to related entity
    related_goal_id = Column(Integer, nullable=True)
    related_check_in_id = Column(Integer, nullable=True)
    
    is_read = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
