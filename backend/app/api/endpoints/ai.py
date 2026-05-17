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
    # Get client lazily
    client = ai_service._get_client()
    
    if not client:
        # Return fallback suggestions if AI is not configured
        fallback_suggestions = [
            {
                "title": "Improve Code Quality",
                "description": "Reduce technical debt by refactoring legacy code and implementing best practices. Focus on improving code maintainability and reducing bug count by 20%.",
                "target": "20",
                "uom_type": "Percentage",
                "suggested_weightage": 20
            },
            {
                "title": "Enhance Team Collaboration",
                "description": "Conduct weekly knowledge sharing sessions and improve team communication. Implement pair programming practices to enhance code quality and team learning.",
                "target": "12",
                "uom_type": "Numeric",
                "suggested_weightage": 15
            },
            {
                "title": "Performance Optimization",
                "description": "Optimize application performance by reducing API response times and improving database query efficiency. Target 30% improvement in key metrics.",
                "target": "30",
                "uom_type": "Percentage",
                "suggested_weightage": 25
            },
            {
                "title": "Complete Feature Development",
                "description": "Successfully deliver 3 major features on time with high quality. Ensure proper testing, documentation, and stakeholder approval for each feature.",
                "target": "3",
                "uom_type": "Numeric",
                "suggested_weightage": 20
            },
            {
                "title": "Skill Development",
                "description": "Complete 2 professional certifications or advanced courses relevant to your role. Focus on emerging technologies and industry best practices.",
                "target": "2",
                "uom_type": "Numeric",
                "suggested_weightage": 20
            }
        ]
        return {
            "suggestions": fallback_suggestions,
            "count": len(fallback_suggestions),
            "source": "fallback"
        }
    
    suggestions = ai_service.suggest_goals(role, department, thrust_area)
    
    if not suggestions:
        # Return fallback if AI fails
        fallback_suggestions = [
            {
                "title": "Improve Code Quality",
                "description": "Reduce technical debt by refactoring legacy code and implementing best practices. Focus on improving code maintainability and reducing bug count by 20%.",
                "target": "20",
                "uom_type": "Percentage",
                "suggested_weightage": 20
            },
            {
                "title": "Enhance Team Collaboration",
                "description": "Conduct weekly knowledge sharing sessions and improve team communication. Implement pair programming practices to enhance code quality and team learning.",
                "target": "12",
                "uom_type": "Numeric",
                "suggested_weightage": 15
            },
            {
                "title": "Performance Optimization",
                "description": "Optimize application performance by reducing API response times and improving database query efficiency. Target 30% improvement in key metrics.",
                "target": "30",
                "uom_type": "Percentage",
                "suggested_weightage": 25
            },
            {
                "title": "Complete Feature Development",
                "description": "Successfully deliver 3 major features on time with high quality. Ensure proper testing, documentation, and stakeholder approval for each feature.",
                "target": "3",
                "uom_type": "Numeric",
                "suggested_weightage": 20
            },
            {
                "title": "Skill Development",
                "description": "Complete 2 professional certifications or advanced courses relevant to your role. Focus on emerging technologies and industry best practices.",
                "target": "2",
                "uom_type": "Numeric",
                "suggested_weightage": 20
            }
        ]
        return {
            "suggestions": fallback_suggestions,
            "count": len(fallback_suggestions),
            "source": "fallback"
        }
    
    return {
        "suggestions": suggestions,
        "count": len(suggestions),
        "source": "ai"
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
