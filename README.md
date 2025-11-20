# Real-Time Project Management Tool

A modern project management tool with real-time collaboration capabilities.

## Features

- **Guest Mode** - Try the app without creating an account (random names like "Lazy Alligator")
- **Kanban Board** - Drag-and-drop task management with To Do, In Progress, and Done columns
- **Real-time Collaboration** - See live updates and online users via WebSockets
- **Task Management** - Create, edit, and assign tasks with priority levels
- **User Presence** - See who's online and collaborating in real-time
- **Modern UI** - Clean, responsive design with smooth animations

## Tech Stack

### Backend
- FastAPI (Python 3.12+)
- PostgreSQL 16
- WebSockets for real-time features
- pytest for testing

### Frontend
- Next.js 15
- React 19
- TypeScript
- Vitest + React Testing Library

## Project Structure

```
.
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
└── docker-compose.yml
```

## Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker & Docker Compose
- uv (Python package manager)

### Setup

1. Start the database:
```bash
docker-compose up -d
```

2. Backend setup:
```bash
cd backend
uv venv
source .venv/bin/activate       # Bash/Zsh
# source .venv/bin/activate.fish  # Fish shell
# .venv\Scripts\activate          # Windows
uv pip install -e ".[dev]"
alembic upgrade head  # Apply database migrations
pytest
```

3. Frontend setup:
```bash
cd frontend
npm install --legacy-peer-deps  # Required for React 19 compatibility
```

### Running the Application

After setup, start both servers:

**Backend** (in `backend/` directory):
```bash
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (in `frontend/` directory):
```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

**Try Guest Mode:** Click "Continue as Guest" to explore without creating an account!

## Testing

This project follows Test-Driven Development (TDD) principles.

- Backend: `cd backend && pytest`
- Frontend: `cd frontend && npm test`

## License

MIT
