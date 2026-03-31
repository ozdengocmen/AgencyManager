from fastapi import APIRouter

from backend.app.api.routes.auth import router as auth_router
from backend.app.api.routes.agent import router as agent_router
from backend.app.api.routes.contracts import router as contracts_router
from backend.app.api.routes.health import router as health_router
from backend.app.api.routes.tools import router as tools_router
from backend.app.api.routes.workflows import router as workflows_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(tools_router, prefix="/tools", tags=["tools"])
api_router.include_router(workflows_router, prefix="/workflows", tags=["workflows"])
api_router.include_router(agent_router, prefix="/agent", tags=["agent"])
api_router.include_router(contracts_router, prefix="/agent/contracts", tags=["agent-contracts"])
