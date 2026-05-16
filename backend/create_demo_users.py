"""
Script to create demo users in production database
Run this once after deployment to set up test accounts
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.user import User
from app.core.security import get_password_hash
from app.core.config import settings

# Convert postgres:// to postgresql:// for async
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

async def create_demo_users():
    # Create async engine
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if users already exist
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == "admin@demo.com"))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print("Demo users already exist!")
            return
        
        # Create demo users
        demo_users = [
            User(
                email="admin@demo.com",
                full_name="Admin User",
                hashed_password=get_password_hash("password123"),
                role="admin",
                department="IT",
                is_active=True
            ),
            User(
                email="manager@demo.com",
                full_name="Manager User",
                hashed_password=get_password_hash("password123"),
                role="manager",
                department="Engineering",
                is_active=True
            ),
            User(
                email="emp1@demo.com",
                full_name="Employee One",
                hashed_password=get_password_hash("password123"),
                role="employee",
                department="Engineering",
                manager_id=2,  # Will be set after manager is created
                is_active=True
            ),
        ]
        
        for user in demo_users:
            session.add(user)
        
        await session.commit()
        print("✅ Demo users created successfully!")
        print("Admin: admin@demo.com / password123")
        print("Manager: manager@demo.com / password123")
        print("Employee: emp1@demo.com / password123")

if __name__ == "__main__":
    asyncio.run(create_demo_users())
