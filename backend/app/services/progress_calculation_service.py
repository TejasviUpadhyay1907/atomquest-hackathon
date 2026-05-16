from app.models.goal import UoMType
from datetime import datetime
from typing import Optional


class ProgressCalculationService:
    """Service for calculating progress scores based on UoM type"""
    
    @staticmethod
    def calculate_progress(uom_type: UoMType, target: str, achievement: str) -> Optional[float]:
        """
        Calculate progress score based on UoM type
        Returns: Progress percentage (0-100+) or None if cannot calculate
        """
        try:
            if uom_type == UoMType.NUMERIC:
                return ProgressCalculationService._calculate_min(target, achievement)
            
            elif uom_type == UoMType.PERCENTAGE:
                return ProgressCalculationService._calculate_min(target, achievement)
            
            elif uom_type == UoMType.TIMELINE:
                return ProgressCalculationService._calculate_timeline(target, achievement)
            
            elif uom_type == UoMType.ZERO:
                return ProgressCalculationService._calculate_zero(achievement)
            
            return None
        
        except Exception as e:
            print(f"Error calculating progress: {e}")
            return None
    
    @staticmethod
    def _calculate_min(target: str, achievement: str) -> float:
        """
        Min type: Higher is better (e.g., Sales Revenue)
        Formula: (Achievement ÷ Target) × 100
        """
        target_val = float(target)
        achievement_val = float(achievement)
        
        if target_val == 0:
            return 0.0
        
        progress = (achievement_val / target_val) * 100
        return round(progress, 2)
    
    @staticmethod
    def _calculate_max(target: str, achievement: str) -> float:
        """
        Max type: Lower is better (e.g., TAT, Cost)
        Formula: (Target ÷ Achievement) × 100
        """
        target_val = float(target)
        achievement_val = float(achievement)
        
        if achievement_val == 0:
            return 0.0
        
        progress = (target_val / achievement_val) * 100
        return round(progress, 2)
    
    @staticmethod
    def _calculate_timeline(target: str, achievement: str) -> float:
        """
        Timeline type: Date-based completion
        Formula: Compare completion date vs deadline
        - If completed on or before deadline: 100%
        - If completed after deadline: Calculate penalty based on delay
        """
        try:
            target_date = datetime.fromisoformat(target.replace('Z', '+00:00'))
            achievement_date = datetime.fromisoformat(achievement.replace('Z', '+00:00'))
            
            if achievement_date <= target_date:
                return 100.0
            
            # Calculate delay penalty
            delay_days = (achievement_date - target_date).days
            
            # Penalty: 5% per day delayed, minimum 0%
            penalty = delay_days * 5
            progress = max(0, 100 - penalty)
            
            return round(progress, 2)
        
        except Exception as e:
            print(f"Error parsing dates: {e}")
            return 0.0
    
    @staticmethod
    def _calculate_zero(achievement: str) -> float:
        """
        Zero type: Zero = Success (e.g., Safety incidents)
        Formula: If achievement = 0 then 100%, else 0%
        """
        try:
            achievement_val = float(achievement)
            return 100.0 if achievement_val == 0 else 0.0
        except:
            return 0.0
    
    @staticmethod
    def get_progress_status(progress_score: float) -> str:
        """
        Get status based on progress score
        Returns: "Excellent", "On Track", "At Risk", "Behind"
        """
        if progress_score >= 100:
            return "Excellent"
        elif progress_score >= 75:
            return "On Track"
        elif progress_score >= 50:
            return "At Risk"
        else:
            return "Behind"
