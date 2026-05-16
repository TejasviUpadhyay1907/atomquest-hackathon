from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.deps import get_current_employee
from app.models.user import User
from app.services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


@router.post("/suggest-goals")
def suggest_goals(
    role: str,
    department: str,
    thrust_area: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Get AI-powered goal suggestions"""
    if not ai_service.client:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set OPENAI_API_KEY."
        )
    
    suggestions = ai_service.suggest_goals(role, department, thrust_area)
    
    if not suggestions:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate suggestions. Please try again."
        )
    
    return {
        "suggestions": suggestions,
        "count": len(suggestions)
    }


@router.post("/improve-description")
def improve_description(
    title: str,
    description: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Use AI to improve goal description"""
    if not ai_service.client:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set OPENAI_API_KEY."
        )
    
    improved = ai_service.improve_goal_description(title, description)
    
    return {
        "original": description,
        "improved": improved
    }
