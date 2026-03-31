"""Auth/session routes for Phase 10."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from backend.app.api.dependencies import AuthContext, get_auth_context, get_repository
from backend.app.core.config import get_settings
from backend.app.repositories import RepositoryGateway
from backend.app.schemas.auth import LoginRequest, LoginResponse, LogoutResponse, MeResponse

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    repository: RepositoryGateway = Depends(get_repository),
) -> LoginResponse:
    user = repository.authenticate(email=payload.email, password=payload.password, role=payload.role)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    portfolio_scope = payload.portfolio_scope or user.portfolio_scope
    session = repository.create_session(
        user=user,
        language=payload.language,
        portfolio_scope=portfolio_scope,
        ttl_hours=get_settings().session_ttl_hours,
    )

    response_user = user.model_copy(update={"portfolio_scope": portfolio_scope})
    return LoginResponse(token=session.token, expires_at=session.expires_at, user=response_user)


@router.post("/logout", response_model=LogoutResponse)
def logout(
    context: AuthContext = Depends(get_auth_context),
    repository: RepositoryGateway = Depends(get_repository),
) -> LogoutResponse:
    repository.revoke_session(context.session.token)
    return LogoutResponse(success=True)


@router.get("/me", response_model=MeResponse)
def me(context: AuthContext = Depends(get_auth_context)) -> MeResponse:
    scoped_user = context.user.model_copy(update={"portfolio_scope": context.session.portfolio_scope})
    return MeResponse(user=scoped_user, session_expires_at=context.session.expires_at)
