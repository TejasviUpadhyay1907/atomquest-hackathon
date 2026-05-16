from sqlalchemy.orm import Session
from app.models.goal import Goal, GoalStatus
from fastapi import HTTPException


class GoalValidationService:
    """Service for validating goal creation and submission rules"""
    
    @staticmethod
    def validate_total_weightage(db: Session, user_id: int, new_weightage: float, exclude_goal_id: int = None) -> dict:
        """
        Validate that total weightage equals 100%
        Returns: {"valid": bool, "current_total": float, "message": str}
        """
        # Get all non-rejected goals for user
        query = db.query(Goal).filter(
            Goal.user_id == user_id,
            Goal.status != GoalStatus.REJECTED
        )
        
        # Exclude current goal if updating
        if exclude_goal_id:
            query = query.filter(Goal.id != exclude_goal_id)
        
        goals = query.all()
        current_total = sum(g.weightage for g in goals) + new_weightage
        
        if current_total > 100:
            return {
                "valid": False,
                "current_total": current_total,
                "message": f"Total weightage would be {current_total}%. Maximum allowed is 100%. Please reduce by {current_total - 100}%."
            }
        
        return {
            "valid": True,
            "current_total": current_total,
            "message": f"Current total: {current_total}%. {100 - current_total}% remaining."
        }
    
    @staticmethod
    def validate_min_weightage(weightage: float) -> dict:
        """
        Validate minimum weightage of 10%
        Returns: {"valid": bool, "message": str}
        """
        if weightage < 10:
            return {
                "valid": False,
                "message": f"Weightage must be at least 10%. Current: {weightage}%"
            }
        return {
            "valid": True,
            "message": "Weightage is valid"
        }
    
    @staticmethod
    def validate_max_goals(db: Session, user_id: int, exclude_goal_id: int = None) -> dict:
        """
        Validate maximum 8 goals per employee
        Returns: {"valid": bool, "current_count": int, "message": str}
        """
        query = db.query(Goal).filter(
            Goal.user_id == user_id,
            Goal.status != GoalStatus.REJECTED
        )
        
        if exclude_goal_id:
            query = query.filter(Goal.id != exclude_goal_id)
        
        current_count = query.count()
        
        if current_count >= 8:
            return {
                "valid": False,
                "current_count": current_count,
                "message": f"Maximum 8 goals allowed. You currently have {current_count} goals."
            }
        
        return {
            "valid": True,
            "current_count": current_count,
            "message": f"You have {current_count}/8 goals."
        }
    
    @staticmethod
    def validate_submission(db: Session, user_id: int) -> dict:
        """
        Validate all rules before submission
        Returns: {"valid": bool, "errors": list}
        """
        errors = []
        
        # Get all non-rejected goals
        goals = db.query(Goal).filter(
            Goal.user_id == user_id,
            Goal.status != GoalStatus.REJECTED
        ).all()
        
        if not goals:
            errors.append("No goals to submit. Please create at least one goal.")
            return {"valid": False, "errors": errors}
        
        # Check total weightage
        total_weightage = sum(g.weightage for g in goals)
        if total_weightage != 100:
            errors.append(f"Total weightage must equal 100%. Current total: {total_weightage}%")
        
        # Check minimum weightage per goal
        for goal in goals:
            if goal.weightage < 10:
                errors.append(f"Goal '{goal.title}' has {goal.weightage}% weightage. Minimum is 10%.")
        
        # Check max goals
        if len(goals) > 8:
            errors.append(f"Maximum 8 goals allowed. You have {len(goals)} goals.")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    @staticmethod
    def can_edit_goal(goal: Goal) -> dict:
        """
        Check if goal can be edited
        Returns: {"can_edit": bool, "reason": str}
        """
        if goal.is_locked:
            return {
                "can_edit": False,
                "reason": "Goal is locked after approval. Contact admin to unlock."
            }
        
        if goal.status == GoalStatus.PENDING_APPROVAL:
            return {
                "can_edit": False,
                "reason": "Goal is pending approval. Wait for manager review or withdraw submission."
            }
        
        return {
            "can_edit": True,
            "reason": "Goal can be edited"
        }
