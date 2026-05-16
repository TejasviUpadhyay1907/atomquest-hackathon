#!/usr/bin/env python3
"""Check password hash lengths"""

from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()

print("📏 Checking password hash lengths...\n")

users = db.query(User).filter(User.email.in_(["admin@demo.com", "manager@demo.com", "emp1@demo.com"])).all()

for user in users:
    print(f"Email: {user.email}")
    print(f"Hash: {user.password_hash}")
    print(f"Hash length: {len(user.password_hash)} characters")
    print(f"Hash bytes: {len(user.password_hash.encode('utf-8'))} bytes")
    print()

db.close()
