#!/usr/bin/env python3
"""Generate a simple bcrypt hash"""

import bcrypt

password = "password123"
salt = bcrypt.gensalt(rounds=10)  # Use lower rounds for simplicity
hash1 = bcrypt.hashpw(password.encode('utf-8'), salt)

print(f"Password: {password}")
print(f"Hash: {hash1.decode('utf-8')}")
print(f"Length: {len(hash1.decode('utf-8'))}")

# Verify it works
is_valid = bcrypt.checkpw(password.encode('utf-8'), hash1)
print(f"Verification: {is_valid}")
