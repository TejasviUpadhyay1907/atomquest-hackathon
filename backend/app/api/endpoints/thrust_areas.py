from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.thrust_area import ThrustArea

router = APIRouter()


@router.get("/")
def get_thrust_areas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all thrust areas"""
    thrust_areas = db.query(ThrustArea).all()
    
    return [
        {
            "id": ta.id,
            "name": ta.name,
            "description": ta.description
        }
        for ta in thrust_areas
    ]
