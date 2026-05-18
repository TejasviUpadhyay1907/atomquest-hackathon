from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_employee, get_current_manager
from app.models.user import User
from app.models.goal import Goal, GoalStatus
from app.models.check_in import CheckIn
from app.schemas.check_in import CheckInCreate, CheckInUpdate, CheckInResponse
from app.services.progress_calculation_service import ProgressCalculationService

router = APIRouter()


@router.post("/", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
def create_check_in(
    check_in_data: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Create a quarterly check-in"""
    # Validate goal exists and belongs to user
    goal = db.query(Goal).filter(
        Goal.id == check_in_data.goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or does not belong to you"
        )
    
    if goal.status != GoalStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only create check-ins for approved goals"
        )
    
    # Check if check-in already exists for this quarter
    existing = db.query(CheckIn).filter(
        CheckIn.goal_id == check_in_data.goal_id,
        CheckIn.quarter == check_in_data.quarter
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Check-in for {check_in_data.quarter} already exists. Use update endpoint."
        )
    
    # Calculate progress if achievement provided
    progress_score = None
    if check_in_data.actual_achievement:
        progress_score = ProgressCalculationService.calculate_progress(
            goal.uom_type,
            goal.target,
            check_in_data.actual_achievement
        )
    
    # Create check-in
    check_in = CheckIn(
        goal_id=check_in_data.goal_id,
        quarter=check_in_data.quarter,
        planned_target=goal.target,  # Copy current target
        actual_achievement=check_in_data.actual_achievement,
        status=check_in_data.status,
        progress_score=progress_score
    )
    
    db.add(check_in)
    db.commit()
    db.refresh(check_in)
    
    # If shared goal, sync achievement to linked goals
    if goal.is_shared and goal.primary_owner_id == current_user.id:
        # This is the primary owner updating
        linked_goals = db.query(Goal).filter(
            Goal.shared_goal_id == goal.id
        ).all()
        
        for linked_goal in linked_goals:
            # Create/update check-in for linked goal
            linked_check_in = db.query(CheckIn).filter(
                CheckIn.goal_id == linked_goal.id,
                CheckIn.quarter == check_in_data.quarter
            ).first()
            
            if linked_check_in:
                linked_check_in.actual_achievement = check_in_data.actual_achievement
                linked_check_in.progress_score = progress_score
            else:
                linked_check_in = CheckIn(
                    goal_id=linked_goal.id,
                    quarter=check_in_data.quarter,
                    planned_target=goal.target,
                    actual_achievement=check_in_data.actual_achievement,
                    status=check_in_data.status,
                    progress_score=progress_score
                )
                db.add(linked_check_in)
        
        db.commit()
    
    return check_in


@router.get("/my-checkins", response_model=List[CheckInResponse])
def get_my_check_ins(
    quarter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employee)
):
    """Get all check-ins for current user"""
    # Get user's goals
    goal_ids = [g.id for g in current_user.goals]
    
    query = db.query(CheckIn).filter(CheckIn.goal_id.in_(goal_ids))
    
    if quarter:
        query = query.filter(CheckIn.quarter == quarter)
    
    check_ins = query.all()
    return check_ins


@router.get("/{check_in_id}", response_model=CheckInResponse)
def get_check_in(
    check_in_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific check-in"""
    check_in = db.query(CheckIn).filter(CheckIn.id == check_in_id).first()
    
    if not check_in:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check-in not found"
        )
    
    # Check access
    goal = check_in.goal
    if goal.user_id != current_user.id and current_user.id != goal.user.manager_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return check_in


@router.put("/{check_in_id}", response_model=CheckInResponse)
def update_check_in(
    check_in_id: int,
    check_in_data: CheckInUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a check-in"""
    check_in = db.query(CheckIn).filter(CheckIn.id == check_in_id).first()
    
    if not check_in:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check-in not found"
        )
    
    goal = check_in.goal
    
    # Employee can update achievement and status
    # Manager can add comments
    if goal.user_id == current_user.id:
        # Employee updating
        if check_in_data.actual_achievement is not None:
            check_in.actual_achievement = check_in_data.actual_achievement
            
            # Recalculate progress
            progress_score = ProgressCalculationService.calculate_progress(
                goal.uom_type,
                goal.target,
                check_in_data.actual_achievement
            )
            check_in.progress_score = progress_score
            
            # Sync to linked goals if primary owner
            if goal.is_shared and goal.primary_owner_id == current_user.id:
                linked_goals = db.query(Goal).filter(
                    Goal.shared_goal_id == goal.id
                ).all()
                
                for linked_goal in linked_goals:
                    linked_check_in = db.query(CheckIn).filter(
                        CheckIn.goal_id == linked_goal.id,
                        CheckIn.quarter == check_in.quarter
                    ).first()
                    
                    if linked_check_in:
                        linked_check_in.actual_achievement = check_in_data.actual_achievement
                        linked_check_in.progress_score = progress_score
        
        if check_in_data.status is not None:
            check_in.status = check_in_data.status
    
    elif current_user.id == goal.user.manager_id:
        # Manager adding comment
        if check_in_data.manager_comment is not None:
            check_in.manager_comment = check_in_data.manager_comment
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    db.commit()
    db.refresh(check_in)
    
    return check_in


@router.get("/manager/team-checkins", response_model=List[dict])
def get_team_check_ins(
    quarter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    """Get all check-ins for manager's team"""
    team_member_ids = [member.id for member in current_user.team_members]
    
    # Get all goals for team
    goals = db.query(Goal).filter(
        Goal.user_id.in_(team_member_ids),
        Goal.status == GoalStatus.APPROVED
    ).all()
    
    goal_ids = [g.id for g in goals]
    
    query = db.query(CheckIn).filter(CheckIn.goal_id.in_(goal_ids))
    
    if quarter:
        query = query.filter(CheckIn.quarter == quarter)
    
    check_ins = query.all()
    
    # Format response with employee and goal info
    result = []
    for check_in in check_ins:
        goal = check_in.goal
        employee = goal.user
        
        # Convert enum status to display value
        status_display_map = {
            'ON_TRACK': 'On Track',
            'COMPLETED': 'Completed',
            'NOT_STARTED': 'Not Started',
        }
        raw_status = str(check_in.status.value if hasattr(check_in.status, 'value') else check_in.status)
        display_status = status_display_map.get(raw_status, raw_status)
        
        result.append({
            "check_in_id": check_in.id,
            "employee_id": employee.id,
            "employee_name": employee.full_name,
            "goal_id": goal.id,
            "goal_title": goal.title,
            "quarter": check_in.quarter,
            "planned_target": check_in.planned_target,
            "actual_achievement": check_in.actual_achievement,
            "status": display_status,
            "progress_score": check_in.progress_score,
            "manager_comment": check_in.manager_comment,
            "created_at": check_in.created_at,
            "updated_at": check_in.updated_at
        })
    
    return result
