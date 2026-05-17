from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum as SQLEnum, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class UoMType(str, enum.Enum):
    NUMERIC = "Numeric"
    PERCENTAGE = "Percentage"
    TIMELINE = "Timeline"
    ZERO = "Zero"


class GoalStatus(str, enum.Enum):
    DRAFT = "Draft"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    thrust_area_id = Column(Integer, ForeignKey("thrust_areas.id"), nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    uom_type = Column(SQLEnum(UoMType), nullable=False)
    target = Column(String, nullable=False)  # Store as string to handle dates and numbers
    current_value = Column(String, nullable=True, default="0")  # Current progress value
    progress = Column(Float, nullable=True, default=0.0)  # Progress percentage (0-100)
    weightage = Column(Float, nullable=False)
    
    status = Column(SQLEnum(GoalStatus), nullable=False, default=GoalStatus.DRAFT)
    is_locked = Column(Boolean, default=False)
    
    # Shared goals
    is_shared = Column(Boolean, default=False)
    primary_owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    shared_goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)  # Links to primary shared goal
    
    # Rejection reason
    rejection_reason = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="goals", foreign_keys=[user_id])
    primary_owner = relationship("User", foreign_keys=[primary_owner_id])
    thrust_area = relationship("ThrustArea", back_populates="goals")
    check_ins = relationship("CheckIn", back_populates="goal", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="goal", cascade="all, delete-orphan")
    
    # Self-referential for shared goals
    linked_goals = relationship("Goal", backref="primary_goal", remote_side=[id], foreign_keys=[shared_goal_id])
