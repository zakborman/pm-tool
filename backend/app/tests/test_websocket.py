"""Tests for WebSocket connection manager and real-time features - TDD."""
import pytest
from fastapi.testclient import TestClient

from app.core.websocket_manager import ConnectionManager
from app.models.user import User


class TestConnectionManager:
    """Test suite for WebSocket connection manager."""

    def test_connection_manager_singleton(self) -> None:
        """Test that ConnectionManager is a singleton."""
        manager1 = ConnectionManager()
        manager2 = ConnectionManager()
        assert manager1 is manager2

    def test_connect_user(self) -> None:
        """Test connecting a user."""
        manager = ConnectionManager()
        manager.clear_all()  # Clean slate

        user_id = 1
        mock_websocket = "mock_websocket_connection"

        manager.connect(user_id, mock_websocket)
        assert manager.is_connected(user_id)
        assert len(manager.get_active_users()) == 1

    def test_disconnect_user(self) -> None:
        """Test disconnecting a user."""
        manager = ConnectionManager()
        manager.clear_all()

        user_id = 1
        mock_websocket = "mock_websocket_1"

        manager.connect(user_id, mock_websocket)
        assert manager.is_connected(user_id)

        manager.disconnect(user_id)
        assert not manager.is_connected(user_id)
        assert len(manager.get_active_users()) == 0

    def test_get_active_users(self) -> None:
        """Test getting list of active users."""
        manager = ConnectionManager()
        manager.clear_all()

        # Connect multiple users
        manager.connect(1, "ws1")
        manager.connect(2, "ws2")
        manager.connect(3, "ws3")

        active_users = manager.get_active_users()
        assert len(active_users) == 3
        assert set(active_users) == {1, 2, 3}

    def test_get_user_presence_info(self) -> None:
        """Test getting presence information for a user."""
        manager = ConnectionManager()
        manager.clear_all()

        user_id = 1
        manager.connect(user_id, "ws1")

        presence = manager.get_presence_info(user_id)
        assert presence is not None
        assert presence["user_id"] == user_id
        assert presence["is_online"] is True
        assert "connected_at" in presence

    def test_get_presence_info_offline_user(self) -> None:
        """Test getting presence info for offline user."""
        manager = ConnectionManager()
        manager.clear_all()

        presence = manager.get_presence_info(999)
        assert presence["user_id"] == 999
        assert presence["is_online"] is False

    def test_multiple_connections_same_user(self) -> None:
        """Test handling multiple connections from same user (e.g., multiple tabs)."""
        manager = ConnectionManager()
        manager.clear_all()

        user_id = 1
        manager.connect(user_id, "ws1")
        manager.connect(user_id, "ws2")  # Same user, different connection

        # Should still count as one active user
        assert len(manager.get_active_users()) == 1
        assert manager.is_connected(user_id)


class TestWebSocketEndpoint:
    """Test suite for WebSocket endpoint."""

    def test_websocket_requires_auth(self, client: TestClient) -> None:
        """Test that WebSocket connection requires authentication."""
        # Attempt to connect without token
        with pytest.raises(Exception):
            with client.websocket_connect("/ws"):
                pass

    def test_websocket_invalid_token(self, client: TestClient) -> None:
        """Test WebSocket connection with invalid token fails."""
        with pytest.raises(Exception):
            with client.websocket_connect("/ws?token=invalid_token"):
                pass

    def test_websocket_connect_success(self, client: TestClient, auth_token: str) -> None:
        """Test successful WebSocket connection with valid token."""
        with client.websocket_connect(f"/ws?token={auth_token}") as websocket:
            # Should receive initial presence update
            data = websocket.receive_json()
            assert data["type"] == "presence_update"
            assert "users" in data

    def test_websocket_presence_broadcast(
        self, client: TestClient, auth_token: str
    ) -> None:
        """Test that user presence is broadcast to all connected users."""
        # Create a second user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "user2@example.com",
                "password": "password123",
            },
        )
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "user2@example.com",
                "password": "password123",
            },
        )
        token2 = response.json()["access_token"]

        # Connect first user
        with client.websocket_connect(f"/ws?token={auth_token}") as ws1:
            data = ws1.receive_json()
            assert data["type"] == "presence_update"
            initial_count = len(data["users"])

            # Connect second user
            with client.websocket_connect(f"/ws?token={token2}") as ws2:
                # First user should receive presence update
                data = ws1.receive_json()
                assert data["type"] == "presence_update"
                assert len(data["users"]) == initial_count + 1

                # Second user gets initial presence
                data = ws2.receive_json()
                assert data["type"] == "presence_update"
                assert len(data["users"]) == initial_count + 1


class TestTaskBroadcasting:
    """Test suite for real-time task update broadcasting."""

    def test_task_create_broadcast(
        self, client: TestClient, auth_token: str
    ) -> None:
        """Test that task creation is broadcast to connected users."""
        with client.websocket_connect(f"/ws?token={auth_token}") as websocket:
            # Skip initial presence update
            websocket.receive_json()

            # Create a task via REST API
            response = client.post(
                "/api/v1/tasks",
                json={"title": "Test Task"},
                headers={"Authorization": f"Bearer {auth_token}"},
            )
            assert response.status_code == 201
            task_data = response.json()

            # Should receive task created event via WebSocket
            event = websocket.receive_json()
            assert event["type"] == "task_created"
            assert event["task"]["id"] == task_data["id"]
            assert event["task"]["title"] == "Test Task"

    def test_task_update_broadcast(
        self, client: TestClient, auth_token: str
    ) -> None:
        """Test that task updates are broadcast to connected users."""
        # Create a task first
        response = client.post(
            "/api/v1/tasks",
            json={"title": "Original Title"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        task_id = response.json()["id"]

        with client.websocket_connect(f"/ws?token={auth_token}") as websocket:
            # Skip initial presence update (task was created before connection)
            websocket.receive_json()  # presence

            # Update the task
            response = client.put(
                f"/api/v1/tasks/{task_id}",
                json={"title": "Updated Title", "status": "in_progress"},
                headers={"Authorization": f"Bearer {auth_token}"},
            )
            assert response.status_code == 200

            # Should receive task updated event
            event = websocket.receive_json()
            assert event["type"] == "task_updated"
            assert event["task"]["id"] == task_id
            assert event["task"]["title"] == "Updated Title"
            assert event["task"]["status"] == "in_progress"

    def test_task_delete_broadcast(
        self, client: TestClient, auth_token: str
    ) -> None:
        """Test that task deletion is broadcast to connected users."""
        # Create a task first
        response = client.post(
            "/api/v1/tasks",
            json={"title": "Task to Delete"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        task_id = response.json()["id"]

        with client.websocket_connect(f"/ws?token={auth_token}") as websocket:
            # Skip initial presence update (task was created before connection)
            websocket.receive_json()  # presence

            # Delete the task
            response = client.delete(
                f"/api/v1/tasks/{task_id}",
                headers={"Authorization": f"Bearer {auth_token}"},
            )
            assert response.status_code == 204

            # Should receive task deleted event
            event = websocket.receive_json()
            assert event["type"] == "task_deleted"
            assert event["task_id"] == task_id
