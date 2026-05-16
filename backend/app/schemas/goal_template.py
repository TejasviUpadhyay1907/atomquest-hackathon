from pydantic import BaseModel
from typing import Optional
from app.models.goal import UoMType


class GoalTemplateResponse(BaseModel):
    id: int
    role: str
    department: str
    thrust_area_name: str
    title: str
    description: Optional[str] = None
    uom_type: UoMType
    suggested_target: Optional[str] = None
    suggested_weightage: Optional[float] = None
    
    class Config:
        from_attributes = True
