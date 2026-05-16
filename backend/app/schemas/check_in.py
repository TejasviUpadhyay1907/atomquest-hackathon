from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.check_in import Quarter, CheckInStatus


class CheckInCreate(BaseModel):
    goal_id: int
    quarter: Quarter
    actual_achievement: Optional[str] = None
    status: CheckInStatus = CheckInStatus.NOT_STARTED


class CheckInUpdate(BaseModel):
    actual_achievement: Optional[str] = None
    status: Optional[CheckInStatus] = None
    manager_comment: Optional[str] = None


class CheckInResponse(BaseModel):
    id: int
    goal_id: int
    quarter: Quarter
    planned_target: str
    actual_achievement: Optional[str] = None
    status: CheckInStatus
    progress_score: Optional[float] = None
    manager_comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
