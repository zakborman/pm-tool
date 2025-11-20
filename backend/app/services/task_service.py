"""Task service for business logic."""
from sqlalchemy.orm import Session

from app.api.schemas import TaskCreate, TaskUpdate
from app.models.task import Task
from app.models.user import User


def create_task(db: Session, task_create: TaskCreate, owner: User) -> Task:
    """Create a new task."""
    db_task = Task(
        title=task_create.title,
        description=task_create.description,
        status=task_create.status,
        priority=task_create.priority,
        owner_id=owner.id,
        assigned_to_id=task_create.assigned_to_id,
        due_date=task_create.due_date,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def get_tasks(db: Session, owner: User) -> list[Task]:
    """Get all tasks for a user."""
    return db.query(Task).filter(Task.owner_id == owner.id).all()


def get_task(db: Session, task_id: int, owner: User) -> Task | None:
    """Get a single task by ID."""
    return (
        db.query(Task)
        .filter(Task.id == task_id, Task.owner_id == owner.id)
        .first()
    )


def update_task(
    db: Session, task_id: int, task_update: TaskUpdate, owner: User
) -> Task | None:
    """Update a task."""
    db_task = get_task(db, task_id, owner)
    if not db_task:
        return None

    # Update only provided fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int, owner: User) -> bool:
    """Delete a task."""
    db_task = get_task(db, task_id, owner)
    if not db_task:
        return False

    db.delete(db_task)
    db.commit()
    return True
