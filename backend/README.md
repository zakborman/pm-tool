# PM Tool Backend

FastAPI backend for the real-time project management tool.

## Setup

1. Create virtual environment with uv:
```bash
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

2. Install dependencies:
```bash
uv pip install -e ".[dev]"
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start PostgreSQL:
```bash
docker-compose up -d
```

5. Run migrations (after creating them):
```bash
alembic upgrade head
```

6. Run the development server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing

Run all tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

## Project Structure

```
app/
├── api/           # API routes and endpoints
├── core/          # Core utilities (config, security)
├── models/        # SQLAlchemy models
├── services/      # Business logic
└── tests/         # Test files
```
