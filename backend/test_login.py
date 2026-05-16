#!/usr/bin/env python3
"""Test login functionality"""

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, create_access_token

db = SessionLocal()

print("🔐 Testing login for demo users...\n")

test_credentials = [
    ("admin@demo.com", "password123"),
    ("manager@demo.com", "password123"),
    ("emp1@demo.com", "password123")
]

for email, password in test_credentials:
    print(f"Testing: {email}")
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"   ❌ User not found")
        continue
    
    print(f"   ✓ User found: {user.full_name}")
    print(f"   ✓ Role: {user.role}")
    print(f"   ✓ Hash: {user.password_hash[:50]}...")
    
    # Verify password
    try:
        is_valid = verify_password(password, user.password_hash)
        print(f"   {'✅' if is_valid else '❌'} Password verification: {is_valid}")
        
        if is_valid:
            # Try to create token
            try:
                token = create_access_token(data={"sub": str(user.id)})
                print(f"   ✅ Token created: {token[:50]}...")
                
                # Try to serialize role
                try:
                    role_str = str(user.role.value) if hasattr(user.role, 'value') else str(user.role)
                    print(f"   ✅ Role serialization: {role_str}")
                except Exception as e:
                    print(f"   ❌ Role serialization failed: {e}")
                    
            except Exception as e:
                print(f"   ❌ Token creation failed: {e}")
                import traceback
                traceback.print_exc()
    except Exception as e:
        print(f"   ❌ Password verification failed: {e}")
        import traceback
        traceback.print_exc()
    
    print()

db.close()
