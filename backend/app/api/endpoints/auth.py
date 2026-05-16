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
    """Fix passwords for existing demo users and create if missing"""
    try:
        from app.models.user import UserRole
        fixed_users = []
        created_users = []
        
        # Valid bcrypt hash for "password123"
        VALID_HASH = "$2b$12$a5Ypkkro4x3SeSqh/76bIedrwAMVDPZUt5r8oE3K9G1ftlqib4XWW"
        
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
                user.password_hash = VALID_HASH
                user.role = user_data["role"]
                user.full_name = user_data["full_name"]
                user.department = user_data["department"]
                fixed_users.append(email)
            else:
                # Create new user
                user = User(
                    email=email,
                    password_hash=VALID_HASH,
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    department=user_data["department"]
                )
                db.add(user)
                created_users.append(email)
        
        db.commit()
        
        return {
            "message": "Demo users fixed/created successfully",
            "fixed": fixed_users,
            "created": created_users,
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
        print(f"🔐 Login attempt for: {credentials.email}")
        print(f"   Password length: {len(credentials.password)} chars")
        
        # Find user
        user = db.query(User).filter(User.email == credentials.email).first()
        
        if not user:
            print(f"❌ User not found: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        print(f"✓ User found: {user.full_name}, Role: {user.role}")
        print(f"   Hash length: {len(user.password_hash)} chars")
        
        # Verify password
        password_valid = verify_password(credentials.password, user.password_hash)
        print(f"✓ Password verification: {password_valid}")
        
        if not password_valid:
            print(f"❌ Invalid password for: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Create access token - IMPORTANT: sub must be a string
        access_token = create_access_token(data={"sub": str(user.id)})
        print(f"✓ Token created for user ID: {user.id}")
        
        # Serialize role safely
        try:
            role_str = str(user.role.value) if hasattr(user.role, 'value') else str(user.role)
        except Exception as role_error:
            print(f"⚠️ Role serialization issue: {role_error}, using fallback")
            role_str = "Employee"  # Fallback
        
        print(f"✓ Role serialized: {role_str}")
        
        # Return simple response
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": role_str,
                "department": user.department,
                "manager_id": user.manager_id
            }
        }
        
        print(f"✅ Login successful for: {credentials.email}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.options("/login")
def login_options():
    """Handle CORS preflight for login"""
    return {"message": "OK"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_db)):
    """Get current user information"""
    return current_user
