#!/usr/bin/env python3
"""Fix all demo user passwords and ensure they exist"""

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash, verify_password

db = SessionLocal()

# Valid bcrypt hash for "password123" (without problematic characters)
VALID_HASH = "$2b$12$a5Ypkkro4x3SeSqh/76bIedrwAMVDPZUt5r8oE3K9G1ftlqib4XWW"

print("🔧 Fixing demo users...\n")

# Demo users configuration
demo_users = [
    {
        "email": "admin@demo.com",
        "full_name": "Admin User",
        "role": UserRole.ADMIN,
        "department": "Administration"
    },
    {
        "email": "manager@demo.com",
        "full_name": "Manager User",
        "role": UserRole.MANAGER,
        "department": "Engineering"
    },
    {
        "email": "emp1@demo.com",
        "full_name": "Employee One",
        "role": UserRole.EMPLOYEE,
        "department": "Engineering"
    }
]

for user_data in demo_users:
    email = user_data["email"]
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update existing user
        print(f"✏️  Updating {email}")
        user.password_hash = VALID_HASH
        user.role = user_data["role"]
        user.full_name = user_data["full_name"]
        user.department = user_data["department"]
    else:
        # Create new user
        print(f"➕ Creating {email}")
        user = User(
            email=email,
            password_hash=VALID_HASH,
            full_name=user_data["full_name"],
            role=user_data["role"],
            department=user_data["department"]
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)
    
    # Verify password works
    is_valid = verify_password("password123", user.password_hash)
    print(f"   Password verification: {'✅ WORKS' if is_valid else '❌ FAILED'}")
    print(f"   Role: {user.role}")
    print()

print("✅ All demo users fixed!")
print("\n📋 Demo Credentials:")
print("   Admin:    admin@demo.com / password123")
print("   Manager:  manager@demo.com / password123")
print("   Employee: emp1@demo.com / password123")

db.close()
