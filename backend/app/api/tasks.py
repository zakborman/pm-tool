"""Task management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.schemas import TaskCreate, TaskResponse, TaskUpdate
from app.core.dependencies import get_current_user
from app.core.websocket_manager import ConnectionManager
from app.models.base import get_db
from app.models.user import User
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])
manager = ConnectionManager()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_create: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Create a new task."""
    task = task_service.create_task(db, task_create, current_user)
    task_response = TaskResponse.model_validate(task)

    # Broadcast task creation event
    await manager.broadcast({
        "type": "task_created",
        "task": task_response.model_dump(mode='json'),
    })

    return task_response


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TaskResponse]:
    """Get all tasks for current user."""
    tasks = task_service.get_tasks(db, current_user)
    return [TaskResponse.model_validate(task) for task in tasks]


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Get a single task by ID."""
    task = task_service.get_task(db, task_id, current_user)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return TaskResponse.model_validate(task)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TaskResponse:
    """Update a task."""
    task = task_service.update_task(db, task_id, task_update, current_user)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    task_response = TaskResponse.model_validate(task)

    # Broadcast task update event
    await manager.broadcast({
        "type": "task_updated",
        "task": task_response.model_dump(mode='json'),
    })

    return task_response


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a task."""
    success = task_service.delete_task(db, task_id, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Broadcast task deletion event
    await manager.broadcast({
        "type": "task_deleted",
        "task_id": task_id,
    })
