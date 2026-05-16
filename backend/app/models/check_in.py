from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum as SQLEnum, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class Quarter(str, enum.Enum):
    Q1 = "Q1"
    Q2 = "Q2"
    Q3 = "Q3"
    Q4 = "Q4"


class CheckInStatus(str, enum.Enum):
    NOT_STARTED = "Not Started"
    ON_TRACK = "On Track"
    COMPLETED = "Completed"


class CheckIn(Base):
    __tablename__ = "check_ins"
    
    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    
    quarter = Column(SQLEnum(Quarter), nullable=False)
    planned_target = Column(String, nullable=False)  # Copy of goal target at check-in time
    actual_achievement = Column(String, nullable=True)
    
    status = Column(SQLEnum(CheckInStatus), nullable=False, default=CheckInStatus.NOT_STARTED)
    progress_score = Column(Float, nullable=True)  # Calculated progress percentage
    
    # Manager feedback
    manager_comment = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    goal = relationship("Goal", back_populates="check_ins")
