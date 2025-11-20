"""User service for business logic."""
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.api.schemas import UserCreate


def get_user_by_email(db: Session, email: str) -> User | None:
    """Get user by email address."""
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_create: UserCreate) -> User:
    """Create a new user."""
    hashed_password = get_password_hash(user_create.password)
    db_user = User(
        email=user_create.email,
        hashed_password=hashed_password,
        full_name=user_create.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
