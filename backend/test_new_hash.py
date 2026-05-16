#!/usr/bin/env python3
"""Test the new hash"""

from app.core.security import verify_password

hash_to_test = "$2b$10$YRgFr/aMdQ52.h1IUkXcgu0xNIHS4fdsg9vjKQLh9Zvb9o7EHOdEm"
password = "password123"

print(f"Testing hash: {hash_to_test}")
print(f"Password: {password}")

result = verify_password(password, hash_to_test)
print(f"Verification result: {result}")

# Also test with bcrypt directly
import bcrypt
direct_result = bcrypt.checkpw(password.encode('utf-8'), hash_to_test.encode('utf-8'))
print(f"Direct bcrypt verification: {direct_result}")
