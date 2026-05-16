from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

for i in range(10):
    hash_val = pwd_context.hash("password123")
    print(f"{i}: {hash_val}")
