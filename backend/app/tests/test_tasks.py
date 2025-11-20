"""Tests for task management endpoints - TDD."""
from fastapi.testclient import TestClient


class TestCreateTask:
    """Test suite for creating tasks."""

    def test_create_task_success(self, client: TestClient, auth_token: str) -> None:
        """Test successful task creation."""
        response = client.post(
            "/api/v1/tasks",
            json={
                "title": "Test Task",
                "description": "This is a test task",
                "status": "todo",
                "priority": "high",
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["description"] == "This is a test task"
        assert data["status"] == "todo"
        assert data["priority"] == "high"
        assert "id" in data
        assert "owner_id" in data
        assert "created_at" in data

    def test_create_task_minimal(self, client: TestClient, auth_token: str) -> None:
        """Test creating task with only required fields."""
        response = client.post(
            "/api/v1/tasks",
            json={"title": "Minimal Task"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Task"
        assert data["status"] == "todo"  # default
        assert data["priority"] == "medium"  # default

    def test_create_task_without_auth(self, client: TestClient) -> None:
        """Test creating task without authentication fails."""
        response = client.post(
            "/api/v1/tasks",
            json={"title": "Test Task"},
        )
        assert response.status_code == 403  # HTTPBearer returns 403 for missing auth

    def test_create_task_invalid_token(self, client: TestClient) -> None:
        """Test creating task with invalid token fails."""
        response = client.post(
            "/api/v1/tasks",
            json={"title": "Test Task"},
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    def test_create_task_empty_title(self, client: TestClient, auth_token: str) -> None:
        """Test creating task with empty title fails validation."""
        response = client.post(
            "/api/v1/tasks",
            json={"title": ""},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 422


class TestGetTasks:
    """Test suite for retrieving tasks."""

    def test_get_all_tasks(self, client: TestClient, auth_token: str) -> None:
        """Test retrieving all tasks for authenticated user."""
        # Create some tasks
        client.post(
            "/api/v1/tasks",
            json={"title": "Task 1"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        client.post(
            "/api/v1/tasks",
            json={"title": "Task 2"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        # Get all tasks
        response = client.get(
            "/api/v1/tasks",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["title"] in ["Task 1", "Task 2"]

    def test_get_tasks_empty_list(self, client: TestClient, auth_token: str) -> None:
        """Test retrieving tasks when none exist."""
        response = client.get(
            "/api/v1/tasks",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 200
        assert response.json() == []

    def test_get_tasks_without_auth(self, client: TestClient) -> None:
        """Test retrieving tasks without authentication fails."""
        response = client.get("/api/v1/tasks")
        assert response.status_code == 403  # HTTPBearer returns 403 for missing auth

    def test_get_single_task(self, client: TestClient, auth_token: str) -> None:
        """Test retrieving a single task by ID."""
        # Create task
        create_response = client.post(
            "/api/v1/tasks",
            json={"title": "Single Task"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        task_id = create_response.json()["id"]

        # Get single task
        response = client.get(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == "Single Task"

    def test_get_nonexistent_task(self, client: TestClient, auth_token: str) -> None:
        """Test retrieving non-existent task returns 404."""
        response = client.get(
            "/api/v1/tasks/99999",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 404


class TestUpdateTask:
    """Test suite for updating tasks."""

    def test_update_task_success(self, client: TestClient, auth_token: str) -> None:
        """Test successful task update."""
        # Create task
        create_response = client.post(
            "/api/v1/tasks",
            json={"title": "Original Title"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        task_id = create_response.json()["id"]

        # Update task
        response = client.put(
            f"/api/v1/tasks/{task_id}",
            json={
                "title": "Updated Title",
                "status": "in_progress",
                "priority": "high",
            },
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["status"] == "in_progress"
        assert data["priority"] == "high"

    def test_update_task_partial(self, client: TestClient, auth_token: str) -> None:
        """Test partial task update."""
        # Create task
        create_response = client.post(
            "/api/v1/tasks",
            json={"title": "Original", "priority": "low"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        task_id = create_response.json()["id"]

        # Update only status
        response = client.put(
            f"/api/v1/tasks/{task_id}",
            json={"status": "done"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "done"
        assert data["title"] == "Original"  # unchanged
        assert data["priority"] == "low"  # unchanged

    def test_update_nonexistent_task(self, client: TestClient, auth_token: str) -> None:
        """Test updating non-existent task returns 404."""
        response = client.put(
            "/api/v1/tasks/99999",
            json={"title": "Updated"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 404

    def test_update_task_without_auth(self, client: TestClient) -> None:
        """Test updating task without authentication fails."""
        response = client.put(
            "/api/v1/tasks/1",
            json={"title": "Updated"},
        )
        assert response.status_code == 403  # HTTPBearer returns 403 for missing auth


class TestDeleteTask:
    """Test suite for deleting tasks."""

    def test_delete_task_success(self, client: TestClient, auth_token: str) -> None:
        """Test successful task deletion."""
        # Create task
        create_response = client.post(
            "/api/v1/tasks",
            json={"title": "Task to Delete"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        task_id = create_response.json()["id"]

        # Delete task
        response = client.delete(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 204

        # Verify task is deleted
        get_response = client.get(
            f"/api/v1/tasks/{task_id}",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert get_response.status_code == 404

    def test_delete_nonexistent_task(self, client: TestClient, auth_token: str) -> None:
        """Test deleting non-existent task returns 404."""
        response = client.delete(
            "/api/v1/tasks/99999",
            headers={"Authorization": f"Bearer {auth_token}"},
        )
        assert response.status_code == 404

    def test_delete_task_without_auth(self, client: TestClient) -> None:
        """Test deleting task without authentication fails."""
        response = client.delete("/api/v1/tasks/1")
        assert response.status_code == 403  # HTTPBearer returns 403 for missing auth
