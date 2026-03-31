from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.router import api_router
from backend.app.core.config import Settings, get_settings
from backend.app.db import ensure_database


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    ensure_database(app_settings)
    app = FastAPI(title=app_settings.app_name, version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=app_settings.api_prefix)

    @app.get("/", tags=["meta"])
    def root() -> dict[str, str]:
        return {"name": app_settings.app_name, "status": "ok"}

    return app


app = create_app()


def run() -> None:
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "backend.app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_env == "development",
    )
