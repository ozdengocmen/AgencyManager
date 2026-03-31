"""Auth/session API schemas for Phase 10."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from backend.app.schemas.persistence import UserRole


class AuthUser(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user_id: UserRole
    role: UserRole
    email: str
    full_name: str
    portfolio_scope: str


class SessionRecord(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: str
    user_id: UserRole
    role: UserRole
    language: str
    portfolio_scope: str
    created_at: datetime
    expires_at: datetime
    revoked_at: datetime | None = None


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=3)
    password: str = Field(min_length=1)
    role: UserRole
    language: str = Field(default="en", pattern="^(en|tr)$")
    portfolio_scope: str | None = None


class LoginResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: str
    expires_at: datetime
    user: AuthUser


class LogoutResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    success: bool = True


class MeResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    user: AuthUser
    session_expires_at: datetime
