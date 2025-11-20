# Real-Time Project Management Tool

A modern project management tool with real-time collaboration capabilities.

## Features

- Task management with CRUD operations
- Real-time collaboration via WebSockets
- User presence indicators
- Project timelines
- Discussion threads
- Offline-first architecture (Phase 2)

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
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"
pytest
```

3. Frontend setup:
```bash
cd frontend
npm install
npm run dev
```

## Testing

This project follows Test-Driven Development (TDD) principles.

- Backend: `cd backend && pytest`
- Frontend: `cd frontend && npm test`

## License

MIT
