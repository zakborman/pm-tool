"""Tests for authentication endpoints - TDD."""
from fastapi.testclient import TestClient

from app.models.user import User
from app.tests.conftest import TestingSessionLocal


class TestUserRegistration:
    """Test suite for user registration endpoint."""

    def test_register_new_user(self, client: TestClient) -> None:
        """Test successful user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["full_name"] == "Test User"
        assert "id" in data
        assert "password" not in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client: TestClient) -> None:
        """Test registration with duplicate email fails."""
        user_data = {
            "email": "test@example.com",
            "password": "securepassword123",
            "full_name": "Test User",
        }
        # Register first user
        response1 = client.post("/api/v1/auth/register", json=user_data)
        assert response1.status_code == 201

        # Try to register again with same email
        response2 = client.post("/api/v1/auth/register", json=user_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()

    def test_register_invalid_email(self, client: TestClient) -> None:
        """Test registration with invalid email fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "securepassword123",
            },
        )
        assert response.status_code == 422  # Validation error

    def test_register_short_password(self, client: TestClient) -> None:
        """Test registration with short password fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "short",
            },
        )
        assert response.status_code == 422  # Validation error

    def test_register_without_password(self, client: TestClient) -> None:
        """Test registration without password fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
            },
        )
        assert response.status_code == 422

    def test_password_is_hashed(self, client: TestClient) -> None:
        """Test that password is properly hashed in database."""
        password = "securepassword123"
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": password,
            },
        )
        assert response.status_code == 201

        # Check database directly
        db = TestingSessionLocal()
        user = db.query(User).filter(User.email == "test@example.com").first()
        assert user is not None
        assert user.hashed_password != password
        assert user.hashed_password.startswith("$2b$")  # bcrypt hash
        db.close()


class TestUserLogin:
    """Test suite for user login endpoint."""

    def test_login_success(self, client: TestClient) -> None:
        """Test successful login returns JWT token."""
        # Register a user first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
            },
        )

        # Login
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0

    def test_login_wrong_password(self, client: TestClient) -> None:
        """Test login with wrong password fails."""
        # Register a user first
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
            },
        )

        # Try to login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client: TestClient) -> None:
        """Test login with non-existent user fails."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "somepassword",
            },
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_invalid_email_format(self, client: TestClient) -> None:
        """Test login with invalid email format fails validation."""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "invalid-email",
                "password": "somepassword",
            },
        )
        assert response.status_code == 422

    def test_token_contains_user_email(self, client: TestClient) -> None:
        """Test that JWT token contains user email."""
        # Register and login
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
            },
        )

        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
            },
        )
        assert response.status_code == 200

        # Decode token (without verification for test purposes)
        from jose import jwt
        from app.core.config import settings

        token = response.json()["access_token"]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "test@example.com"
