from sqlalchemy import Column, Integer, String, Float, Enum as SQLEnum, Text
from app.core.database import Base
from app.models.goal import UoMType


class GoalTemplate(Base):
    __tablename__ = "goal_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    
    role = Column(String, nullable=False)  # e.g., "Software Engineer", "Manager"
    department = Column(String, nullable=False)  # e.g., "Engineering", "Sales"
    thrust_area_name = Column(String, nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    uom_type = Column(SQLEnum(UoMType), nullable=False)
    suggested_target = Column(String, nullable=True)
    suggested_weightage = Column(Float, nullable=True)
