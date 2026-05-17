from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.models.goal import UoMType, GoalStatus


class GoalCreate(BaseModel):
    thrust_area_id: int
    title: str
    description: Optional[str] = None
    uom_type: UoMType
    target: str
    weightage: float
    
    @field_validator('weightage')
    @classmethod
    def validate_weightage(cls, v):
        if v < 10:
            raise ValueError('Weightage must be at least 10%')
        if v > 100:
            raise ValueError('Weightage cannot exceed 100%')
        return v


class GoalUpdate(BaseModel):
    thrust_area_id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    uom_type: Optional[UoMType] = None
    target: Optional[str] = None
    weightage: Optional[float] = None
    
    @field_validator('weightage')
    @classmethod
    def validate_weightage(cls, v):
        if v is not None:
            if v < 10:
                raise ValueError('Weightage must be at least 10%')
            if v > 100:
                raise ValueError('Weightage cannot exceed 100%')
        return v


class GoalSubmit(BaseModel):
    pass  # No additional fields needed, just triggers validation


class GoalResponse(BaseModel):
    id: int
    user_id: int
    thrust_area_id: int
    title: str
    description: Optional[str] = None
    uom_type: UoMType
    target: str
    current_value: Optional[str] = "0"
    progress: Optional[float] = 0.0
    weightage: float
    status: GoalStatus
    is_locked: bool
    is_shared: bool
    primary_owner_id: Optional[int] = None
    shared_goal_id: Optional[int] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class SharedGoalCreate(BaseModel):
    thrust_area_id: int
    title: str
    description: Optional[str] = None
    uom_type: UoMType
    target: str
    primary_owner_id: int
    recipient_ids: list[int]  # List of employee IDs to assign this goal to
