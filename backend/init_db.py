"""
Initialize database with tables and demo users
Run this once after deployment
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.user import User
from app.models.goal import Goal
from app.models.check_in import CheckIn
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.goal_template import GoalTemplate
from app.models.thrust_area import ThrustArea
from app.core.security import get_password_hash
from app.core.config import settings

def init_database():
    print("🔧 Initializing database...")
    
    # Create engine
    engine = create_engine(settings.DATABASE_URL)
    
    # Create all tables
    print("📊 Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created!")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_user = db.query(User).filter(User.email == "admin@demo.com").first()
        if existing_user:
            print("ℹ️  Demo users already exist!")
            return
        
        print("👥 Creating demo users...")
        
        # Create admin
        admin = User(
            email="admin@demo.com",
            full_name="Admin User",
            hashed_password=get_password_hash("password123"),
            role="admin",
            department="IT",
            is_active=True
        )
        db.add(admin)
        db.flush()
        
        # Create manager
        manager = User(
            email="manager@demo.com",
            full_name="Manager User",
            hashed_password=get_password_hash("password123"),
            role="manager",
            department="Engineering",
            is_active=True
        )
        db.add(manager)
        db.flush()
        
        # Create employee
        employee = User(
            email="emp1@demo.com",
            full_name="Employee One",
            hashed_password=get_password_hash("password123"),
            role="employee",
            department="Engineering",
            manager_id=manager.id,
            is_active=True
        )
        db.add(employee)
        
        db.commit()
        
        print("✅ Demo users created successfully!")
        print("   Admin: admin@demo.com / password123")
        print("   Manager: manager@demo.com / password123")
        print("   Employee: emp1@demo.com / password123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
