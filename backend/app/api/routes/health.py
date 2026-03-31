from fastapi import APIRouter

from backend.app.core.config import get_settings
from backend.app.schemas.health import HealthResponse

router = APIRouter()


@router.get("", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(service=settings.app_name, environment=settings.app_env)

