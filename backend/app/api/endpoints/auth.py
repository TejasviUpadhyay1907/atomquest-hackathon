from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role,
        department=user_data.department,
        manager_id=user_data.manager_id
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/fix-demo-passwords")
def fix_demo_passwords(db: Session = Depends(get_db)):
    """Fix passwords for existing demo users"""
    try:
        fixed_users = []
        
        # Update admin password and role
        admin = db.query(User).filter(User.email == "admin@demo.com").first()
        if admin:
            admin.password_hash = "$2b$12$a5Ypkkro4x3SeSqh/76bIedrwAMVDPZUt5r8oE3K9G1ftlqib4XWW"
            admin.role = "Admin"
            fixed_users.append("admin@demo.com")
        
        # Update manager password and role
        manager = db.query(User).filter(User.email == "manager@demo.com").first()
        if manager:
            manager.password_hash = "$2b$12$lDwzzrkRkTXZCkSMRHJEjeLVdjvhXxddCIN8rGinBGaXElTNxDKDi"
            manager.role = "Manager"
            fixed_users.append("manager@demo.com")
        
        # Update employee password and role
        employee = db.query(User).filter(User.email == "emp1@demo.com").first()
        if employee:
            employee.password_hash = "$2b$12$cC/kJp64mAy/fBULwuZNouvl5DBIVScge2fCuwrjgLzhArwAqeVDu"
            employee.role = "Employee"
            fixed_users.append("emp1@demo.com")
        
        db.commit()
        
        return {
            "message": "Demo user passwords fixed successfully",
            "users": fixed_users,
            "credentials": {
                "admin": "admin@demo.com / password123",
                "manager": "manager@demo.com / password123",
                "employee": "emp1@demo.com / password123"
            }
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}


@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    try:
        # Find user
        user = db.query(User).filter(User.email == credentials.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not verify_password(credentials.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token - IMPORTANT: sub must be a string
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "department": user.department,
                "manager_id": user.manager_id
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_db)):
    """Get current user information"""
    return current_user
