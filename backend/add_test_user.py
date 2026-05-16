"""
Add a new test user with a unique password
"""
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole

def add_test_user():
    db = SessionLocal()
    
    try:
        print("🔧 Adding new test user...")
        
        # Check if user already exists
        existing = db.query(User).filter(User.email == "test@atomquest.com").first()
        if existing:
            print("⚠️  User already exists, updating password...")
            existing.password_hash = get_password_hash("AtomQuest2024!")
            db.commit()
            print("✅ Password updated!")
        else:
            # Get a manager
            manager = db.query(User).filter(User.role == UserRole.MANAGER).first()
            
            # Create new test user
            test_user = User(
                email="test@atomquest.com",
                password_hash=get_password_hash("AtomQuest2024!"),
                full_name="Test User",
                role=UserRole.EMPLOYEE,
                department="Engineering",
                manager_id=manager.id if manager else None
            )
            db.add(test_user)
            db.commit()
            print("✅ New test user created!")
        
        print("\n📧 New Test Credentials:")
        print("Email: test@atomquest.com")
        print("Password: AtomQuest2024!")
        print("\nUse these to login!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_test_user()
