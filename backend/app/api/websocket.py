"""WebSocket endpoint for real-time features."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.websocket_manager import ConnectionManager
from app.models.base import get_db
from app.services import user_service

router = APIRouter()
manager = ConnectionManager()


async def get_current_user_ws(
    token: str,
    db: Session = Depends(get_db),
) -> int:
    """
    Validate WebSocket JWT token and return user ID.

    Args:
        token: JWT token from query parameter
        db: Database session

    Returns:
        User ID if valid

    Raises:
        HTTPException: If token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = user_service.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user.id


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db),
) -> None:
    """
    WebSocket endpoint for real-time communication.

    Args:
        websocket: WebSocket connection
        token: JWT token for authentication
        db: Database session
    """
    # Authenticate user
    try:
        user_id = await get_current_user_ws(token, db)
    except HTTPException:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Accept connection
    await websocket.accept()

    # Register connection
    manager.connect(user_id, websocket)

    # Send initial presence update
    await manager.broadcast_presence_update()

    try:
        # Keep connection alive and handle incoming messages
        while True:
            # Wait for any message from client (keeping connection alive)
            data = await websocket.receive_text()
            # For now, we just keep the connection open
            # Future: handle client messages here
    except WebSocketDisconnect:
        # Unregister connection
        manager.disconnect(user_id)
        # Broadcast presence update
        await manager.broadcast_presence_update()
