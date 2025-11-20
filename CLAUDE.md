# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time project management tool with WebSocket-based collaboration features. The project uses a monorepo structure with a FastAPI backend and Next.js frontend.

## Development Setup

### Initial Setup
```bash
# Start PostgreSQL database
docker-compose up -d

# Backend setup
cd backend
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"

# Frontend setup
cd frontend
npm install
```

### Running the Application
```bash
# Backend (from backend/)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (from frontend/)
npm run dev
```

### Database Migrations
```bash
# From backend/ directory
alembic upgrade head
```

## Testing

### Backend Testing
```bash
# From backend/ directory with .venv activated
pytest                           # Run all tests
pytest -v                        # Verbose output
pytest --cov=app --cov-report=html  # With coverage report
pytest app/tests/test_auth.py    # Run specific test file
pytest app/tests/test_auth.py::TestUserRegistration  # Run specific test class
```

### Frontend Testing
```bash
# From frontend/ directory
npm test                  # Run tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

### Linting
```bash
# Backend (from backend/)
ruff check .
mypy .

# Frontend (from frontend/)
npm run lint
```

## Architecture

### Backend Architecture (FastAPI)

**Layer Structure:**
- `app/api/` - Route handlers and Pydantic schemas
- `app/services/` - Business logic layer
- `app/models/` - SQLAlchemy ORM models
- `app/core/` - Core utilities (config, security, WebSocket management)

**Key Components:**
- **WebSocket Manager** (`app/core/websocket_manager.py`): Singleton pattern managing real-time connections, user presence, and message broadcasting
- **Database Session** (`app/models/base.py`): SQLAlchemy engine and session management using settings.DATABASE_URL
- **Configuration** (`app/core/config.py`): Pydantic Settings with .env support for DATABASE_URL, SECRET_KEY, CORS_ORIGINS

**API Structure:**
- All API routes are prefixed with `/api/v1` (defined in settings.API_V1_PREFIX)
- WebSocket endpoint is at root level (no prefix)
- Main routers: `auth`, `tasks`, `websocket`

### Frontend Architecture (Next.js 15)

**Structure:**
- `src/app/` - Next.js App Router pages
- `src/components/` - React components (currently empty, ready for development)
- `src/lib/` - Utilities and custom hooks (currently empty)
- `src/__tests__/` - Vitest test files

**Tech Stack:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Vitest + React Testing Library for tests
- TailwindCSS for styling

### Database

- PostgreSQL 16 running in Docker
- Connection details in docker-compose.yml:
  - User: `pmtool`
  - Password: `pmtool_dev_password`
  - Database: `pmtool_db`
  - Port: 5432

### Real-Time Features

The WebSocket system uses a singleton ConnectionManager:
- Tracks active connections per user (supports multiple connections per user)
- Manages user presence with connection timestamps
- Supports personal messages and broadcasts
- Presence updates broadcast to all connected users

## Development Notes

### TDD Approach
This project follows Test-Driven Development principles. Write tests before implementing features.

### Package Management
- **Backend**: Uses `uv` for Python dependency management (fast alternative to pip)
- **Frontend**: Uses `npm` for JavaScript dependencies

### Python Configuration
- Python 3.12+ required
- Type hints enforced (mypy with `disallow_untyped_defs`)
- Ruff for linting with line length 100
- pytest with async support enabled

### Environment Variables
Backend requires a `.env` file (copy from `.env.example` if it exists). Key variables:
- DATABASE_URL
- SECRET_KEY (change in production)
- CORS_ORIGINS
