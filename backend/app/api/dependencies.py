"""Shared API dependencies for auth/session-protected routes."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.app.repositories import RepositoryGateway, get_repository_gateway
from backend.app.schemas.auth import AuthUser, SessionRecord
from backend.app.schemas.persistence import UserRole

_http_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthContext:
    user: AuthUser
    session: SessionRecord



def get_repository() -> RepositoryGateway:
    return get_repository_gateway()


def get_auth_context(
    credentials: HTTPAuthorizationCredentials | None = Depends(_http_bearer),
    repository: RepositoryGateway = Depends(get_repository),
) -> AuthContext:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required")

    session = repository.get_active_session(credentials.credentials)
    if not session:
        raise HTTPException(status_code=401, detail="Session is invalid or expired")

    user = repository.get_user_by_id(session.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Session user not found")

    return AuthContext(user=user, session=session)


def resolve_scoped_user(
    context: AuthContext,
    requested_user_id: UserRole | None,
) -> UserRole:
    if context.user.role == "manager":
        return requested_user_id or context.user.user_id
    return context.user.user_id


def scoped_user_query(
    user_id: UserRole | None = Query(default=None, pattern="^(manager|salesperson)$"),
) -> UserRole | None:
    return user_id
