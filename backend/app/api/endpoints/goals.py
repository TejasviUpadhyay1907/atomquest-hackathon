from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_employee
from app.models.user import User
from app.models.goal import Goal, GoalStatus
from app.models.thrust_area import ThrustArea
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, GoalSubmit
from app.services.validation_service import GoalValidationService
from app.services.notification_service import NotificationService
from app.services.audit_service import AuditService

router = APIRouter()


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Create a new goal"""
    # Validate max goals
    max_goals_check = GoalValidationService.validate_max_goals(db, current_user.id)
    if not max_goals_check["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=max_goals_check["message"]
        )
    
    # Validate min weightage
    min_weightage_check = GoalValidationService.validate_min_weightage(goal_data.weightage)
    if not min_weightage_check["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=min_weightage_check["message"]
        )
    
    # Validate total weightage
    total_weightage_check = GoalValidationService.validate_total_weightage(
        db, current_user.id, goal_data.weightage
    )
    if not total_weightage_check["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=total_weightage_check["message"]
        )
    
    # Create goal
    goal = Goal(
        user_id=current_user.id,
        thrust_area_id=goal_data.thrust_area_id,
        title=goal_data.title,
        description=goal_data.description,
        uom_type=goal_data.uom_type,
        target=goal_data.target,
        weightage=goal_data.weightage,
        status=GoalStatus.DRAFT
    )
    
    db.add(goal)
    db.commit()
    db.refresh(goal)
    
    return goal


@router.get("/my-goals", response_model=List[GoalResponse])
def get_my_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Get all goals for current user"""
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    return goals


@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific goal"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Check access
    if goal.user_id != current_user.id and current_user.id != goal.user.manager_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Update a goal (only if not locked)"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Check if can edit
    can_edit_check = GoalValidationService.can_edit_goal(goal)
    if not can_edit_check["can_edit"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=can_edit_check["reason"]
        )
    
    # If shared goal, only allow weightage update
    if goal.is_shared and goal.shared_goal_id is not None:
        if goal_data.weightage is not None:
            # Validate weightage
            if goal_data.weightage < 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Weightage must be at least 10%"
                )
            
            # Validate total weightage
            total_check = GoalValidationService.validate_total_weightage(
                db, current_user.id, goal_data.weightage, exclude_goal_id=goal_id
            )
            if not total_check["valid"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=total_check["message"]
                )
            
            old_weightage = goal.weightage
            goal.weightage = goal_data.weightage
            
            # Log change
            AuditService.log_goal_update(
                db, goal.id, current_user.id, "weightage", str(old_weightage), str(goal_data.weightage)
            )
        
        db.commit()
        db.refresh(goal)
        return goal
    
    # Update fields
    update_data = goal_data.model_dump(exclude_unset=True)
    
    # Validate weightage if provided
    if "weightage" in update_data:
        if update_data["weightage"] < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Weightage must be at least 10%"
            )
        
        total_check = GoalValidationService.validate_total_weightage(
            db, current_user.id, update_data["weightage"], exclude_goal_id=goal_id
        )
        if not total_check["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=total_check["message"]
            )
    
    # Log changes
    for field, new_value in update_data.items():
        old_value = getattr(goal, field)
        if old_value != new_value:
            AuditService.log_goal_update(
                db, goal.id, current_user.id, field, str(old_value), str(new_value)
            )
            setattr(goal, field, new_value)
    
    db.commit()
    db.refresh(goal)
    
    return goal


@router.post("/{goal_id}/submit", response_model=GoalResponse)
def submit_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Submit goal for approval"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    if goal.status != GoalStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft goals can be submitted"
        )
    
    # Validate submission
    validation = GoalValidationService.validate_submission(db, current_user.id)
    if not validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="; ".join(validation["errors"])
        )
    
    # Update status
    goal.status = GoalStatus.PENDING_APPROVAL
    from datetime import datetime
    goal.submitted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(goal)
    
    # Send notification to manager
    if current_user.manager_id:
        NotificationService.notify_goal_submitted(
            db, current_user.id, current_user.manager_id, goal.title, goal.id
        )
    
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Delete a goal (only if not locked)"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    if goal.is_locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete locked goal"
        )
    
    db.delete(goal)
    db.commit()
    
    return None


@router.get("/validation/check", response_model=dict)
def check_validation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Check current validation status"""
    validation = GoalValidationService.validate_submission(db, current_user.id)
    
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.status != GoalStatus.REJECTED
    ).all()
    
    total_weightage = sum(g.weightage for g in goals)
    
    return {
        "can_submit": validation["valid"],
        "errors": validation["errors"],
        "total_weightage": total_weightage,
        "goal_count": len(goals),
        "remaining_weightage": 100 - total_weightage
    }
