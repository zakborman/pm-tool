"""Pytest configuration and fixtures for testing."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.websocket_manager import ConnectionManager
from app.main import app
from app.models.base import Base, get_db
from app.models.task import Task  # noqa: F401 - Import to register model
from app.models.user import User  # noqa: F401 - Import to register model

# Test database URL (using SQLite in memory for fast tests)
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after."""
    Base.metadata.create_all(bind=engine)
    # Clear WebSocket connections (singleton state)
    manager = ConnectionManager()
    manager.clear_all()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> TestClient:
    """Create a test client for API testing."""
    return TestClient(app)


@pytest.fixture
def auth_token(client: TestClient) -> str:
    """Create a user and return auth token."""
    # Register user
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "securepassword123",
            "full_name": "Test User",
        },
    )
    # Login and get token
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "testuser@example.com",
            "password": "securepassword123",
        },
    )
    return response.json()["access_token"]
