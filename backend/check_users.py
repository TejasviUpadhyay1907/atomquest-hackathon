#!/usr/bin/env python3
"""Check what users exist in the database"""

from app.core.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

db = SessionLocal()

print("📋 Users in database:\n")
users = db.query(User).all()

for user in users:
    print(f"ID: {user.id}")
    print(f"Email: {user.email}")
    print(f"Name: {user.full_name}")
    print(f"Role: {user.role}")
    print(f"Password Hash: {user.password_hash[:30]}...")
    
    # Test password
    test_password = "password123"
    is_valid = verify_password(test_password, user.password_hash)
    print(f"Password 'password123' works: {'✅ YES' if is_valid else '❌ NO'}")
    print("-" * 50)

db.close()
