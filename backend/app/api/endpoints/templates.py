from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.goal_template import GoalTemplate
from app.schemas.goal_template import GoalTemplateResponse

router = APIRouter()


@router.get("/", response_model=List[GoalTemplateResponse])
def get_templates(
    role: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get goal templates"""
    query = db.query(GoalTemplate)
    
    if role:
        query = query.filter(GoalTemplate.role == role)
    
    if department:
        query = query.filter(GoalTemplate.department == department)
    
    templates = query.all()
    
    return templates
