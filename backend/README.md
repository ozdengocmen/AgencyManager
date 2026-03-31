# Backend Scaffold (Phase 3)

This folder contains the initial FastAPI scaffold for the agentic backend.

## Run locally

1. Install Python deps:
```bash
uv sync
```

2. Start API:
```bash
uv run uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

3. Check health:
```bash
curl http://127.0.0.1:8000/api/health
```

## DB admin commands (Phase 10)

```bash
uv run python -m backend.app.db.admin init
uv run python -m backend.app.db.admin reset
```
