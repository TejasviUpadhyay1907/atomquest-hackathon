from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    action = Column(String, nullable=False)  # e.g., "Updated target", "Unlocked goal", "Approved"
    field_changed = Column(String, nullable=True)  # e.g., "target", "weightage"
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    goal = relationship("Goal", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
