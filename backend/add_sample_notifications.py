#!/usr/bin/env python3
"""
Add sample notifications for testing
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.notification import Notification
from app.models.user import User
from app.core.database import Base

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables")
    sys.exit(1)

print(f"🔗 Connecting to database...")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    print("✅ Connected to database")
    
    # Get demo users
    print("\n👥 Finding demo users...")
    admin = db.query(User).filter(User.email == "admin@demo.com").first()
    manager = db.query(User).filter(User.email == "manager@demo.com").first()
    employee = db.query(User).filter(User.email == "emp1@demo.com").first()
    
    if not all([admin, manager, employee]):
        print("❌ Demo users not found!")
        sys.exit(1)
    
    print(f"✅ Found demo users: Admin (ID: {admin.id}), Manager (ID: {manager.id}), Employee (ID: {employee.id})")
    
    # Clear existing notifications
    print("\n🗑️  Clearing existing notifications...")
    deleted = db.query(Notification).delete()
    db.commit()
    print(f"✅ Deleted {deleted} existing notifications")
    
    # Create sample notifications
    print("\n📬 Creating sample notifications...")
    
    notifications = [
        # Admin notifications
        Notification(
            user_id=admin.id,
            type="system",
            title="Welcome to AtomQuest",
            message="Welcome to the Goal Tracking Portal! You have admin access to manage all users and goals.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        Notification(
            user_id=admin.id,
            type="goal_submitted",
            title="New Goal Submitted",
            message="Employee One has submitted a new goal for Q1 2026. Please review and approve.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=5)
        ),
        Notification(
            user_id=admin.id,
            type="system",
            title="System Update",
            message="The goal tracking system has been updated with new features including AI-powered goal suggestions.",
            is_read=True,
            created_at=datetime.utcnow() - timedelta(days=7)
        ),
        
        # Manager notifications
        Notification(
            user_id=manager.id,
            type="system",
            title="Welcome Manager",
            message="Welcome to the Goal Tracking Portal! You can now manage your team's goals and performance.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=2)
        ),
        Notification(
            user_id=manager.id,
            type="goal_submitted",
            title="Team Member Goal Submitted",
            message="Employee One has submitted their Q1 goals. Please review and provide feedback.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=3)
        ),
        Notification(
            user_id=manager.id,
            type="check_in_due",
            title="Check-in Due",
            message="Q1 check-ins are due this week. Please review your team's progress.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=12)
        ),
        Notification(
            user_id=manager.id,
            type="system",
            title="Performance Report Available",
            message="Your team's Q4 2025 performance report is now available in the Reports section.",
            is_read=True,
            created_at=datetime.utcnow() - timedelta(days=5)
        ),
        
        # Employee notifications
        Notification(
            user_id=employee.id,
            type="system",
            title="Welcome to AtomQuest",
            message="Welcome! Start by setting your goals for Q1 2026. Use AI suggestions to get started quickly.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=1)
        ),
        Notification(
            user_id=employee.id,
            type="goal_approved",
            title="Goal Approved",
            message="Your goal 'Improve Code Quality' has been approved by your manager. Great work!",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=2)
        ),
        Notification(
            user_id=employee.id,
            type="check_in_due",
            title="Q1 Check-in Reminder",
            message="Your Q1 check-in is due in 3 days. Please update your progress on all active goals.",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=8)
        ),
        Notification(
            user_id=employee.id,
            type="manager_comment",
            title="Manager Feedback Received",
            message="Your manager has provided feedback on your Q4 check-in. Check it out!",
            is_read=True,
            created_at=datetime.utcnow() - timedelta(days=3)
        ),
        Notification(
            user_id=employee.id,
            type="system",
            title="New Feature: AI Goal Suggestions",
            message="Try our new AI-powered goal suggestions! Get personalized goal recommendations based on your role.",
            is_read=True,
            created_at=datetime.utcnow() - timedelta(days=6)
        ),
    ]
    
    # Add all notifications
    for notif in notifications:
        db.add(notif)
    
    db.commit()
    print(f"✅ Created {len(notifications)} sample notifications")
    
    # Verify
    print("\n📊 Notification Summary:")
    for user, name in [(admin, "Admin"), (manager, "Manager"), (employee, "Employee")]:
        total = db.query(Notification).filter(Notification.user_id == user.id).count()
        unread = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read == False
        ).count()
        print(f"  • {name}: {total} total ({unread} unread)")
    
    print("\n🎉 Sample notifications created successfully!")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    sys.exit(1)
finally:
    db.close()
