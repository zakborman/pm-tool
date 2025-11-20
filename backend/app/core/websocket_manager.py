"""WebSocket connection manager for real-time features."""
from datetime import datetime
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    """Singleton connection manager for WebSocket connections."""

    _instance: "ConnectionManager | None" = None
    _initialized: bool = False

    def __new__(cls) -> "ConnectionManager":
        """Ensure singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        """Initialize connection manager."""
        if not self._initialized:
            self.active_connections: dict[int, list[WebSocket]] = {}
            self.connection_times: dict[int, datetime] = {}
            ConnectionManager._initialized = True

    def connect(self, user_id: int, websocket: WebSocket) -> None:
        """
        Connect a user's WebSocket.

        Args:
            user_id: User ID to connect
            websocket: WebSocket connection
        """
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
            self.connection_times[user_id] = datetime.utcnow()

        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: int) -> None:
        """
        Disconnect a user.

        Args:
            user_id: User ID to disconnect
        """
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            del self.connection_times[user_id]

    def is_connected(self, user_id: int) -> bool:
        """
        Check if a user is connected.

        Args:
            user_id: User ID to check

        Returns:
            True if user is connected, False otherwise
        """
        return user_id in self.active_connections

    def get_active_users(self) -> list[int]:
        """
        Get list of active user IDs.

        Returns:
            List of user IDs currently connected
        """
        return list(self.active_connections.keys())

    def get_presence_info(self, user_id: int) -> dict[str, Any]:
        """
        Get presence information for a user.

        Args:
            user_id: User ID to get presence for

        Returns:
            Dictionary with presence information
        """
        is_online = self.is_connected(user_id)
        presence: dict[str, Any] = {
            "user_id": user_id,
            "is_online": is_online,
        }

        if is_online:
            presence["connected_at"] = self.connection_times[user_id].isoformat()

        return presence

    def clear_all(self) -> None:
        """Clear all connections (for testing)."""
        self.active_connections.clear()
        self.connection_times.clear()

    async def send_personal_message(self, message: dict[str, Any], user_id: int) -> None:
        """
        Send a message to a specific user's connections.

        Args:
            message: Message to send
            user_id: User ID to send to
        """
        if user_id in self.active_connections:
            for websocket in self.active_connections[user_id]:
                await websocket.send_json(message)

    async def broadcast(self, message: dict[str, Any]) -> None:
        """
        Broadcast a message to all connected users.

        Args:
            message: Message to broadcast
        """
        for connections in self.active_connections.values():
            for websocket in connections:
                await websocket.send_json(message)

    async def broadcast_presence_update(self) -> None:
        """Broadcast current presence information to all connected users."""
        active_users = self.get_active_users()
        message = {
            "type": "presence_update",
            "users": active_users,
        }
        await self.broadcast(message)
