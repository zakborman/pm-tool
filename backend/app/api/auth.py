"""Authentication endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.schemas import Token, UserCreate, UserLogin, UserResponse
from app.core.dependencies import get_current_user
from app.core.name_generator import generate_random_name
from app.core.security import get_password_hash
from app.models.base import get_db
from app.models.user import User
from app.services import auth_service, user_service

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_create: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """Register a new user."""
    # Check if user already exists
    existing_user = user_service.get_user_by_email(db, email=user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    user = user_service.create_user(db, user_create)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)) -> Token:
    """Login user and return JWT token."""
    user = auth_service.authenticate_user(db, user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_service.create_user_token(user.email)
    return Token(access_token=access_token, token_type="bearer")


@router.post("/guest", response_model=Token)
def login_as_guest(db: Session = Depends(get_db)) -> Token:
    """Create a temporary guest user and return JWT token."""
    # Generate random name
    random_name = generate_random_name()

    # Create unique email for guest (using timestamp for uniqueness)
    import time
    guest_email = f"guest_{int(time.time() * 1000)}@guest.local"

    # Create guest user
    guest_user = User(
        email=guest_email,
        hashed_password=get_password_hash("guest"),  # Dummy password
        full_name=random_name,
        is_guest=True,
        is_active=True,
    )
    db.add(guest_user)
    db.commit()
    db.refresh(guest_user)

    # Create and return token
    access_token = auth_service.create_user_token(guest_user.email)
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Get current authenticated user."""
    return UserResponse.model_validate(current_user)


@router.get("/users", response_model=list[UserResponse])
def get_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[UserResponse]:
    """Get all users for task assignment."""
    users = db.query(User).filter(User.is_active == True).all()
    return [UserResponse.model_validate(user) for user in users]
