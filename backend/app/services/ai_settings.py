"""System-level AI runtime configuration helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

from openai import OpenAI

from backend.app.core.config import Settings
from backend.app.schemas.workflows import SystemAISettingsDetail, SystemAIModelListResponse

if TYPE_CHECKING:
    from backend.app.repositories.contracts import RepositoryGateway


@dataclass(frozen=True)
class ResolvedAISettings:
    provider: str
    enabled: bool
    model: str
    base_url: str | None
    api_key: str


FALLBACK_MODELS = [
    "gpt-4.1-mini",
    "gpt-4.1",
    "gpt-5-mini",
    "gpt-5",
]


def resolve_ai_settings(
    *,
    settings: Settings,
    repository: RepositoryGateway | None = None,
) -> ResolvedAISettings:
    gateway = repository
    if gateway is None:
        from backend.app.repositories.sqlite_gateway import get_repository_gateway

        gateway = get_repository_gateway()
    persisted = gateway.get_system_ai_settings()

    provider = persisted.provider if persisted else "openai"
    enabled = persisted.enabled if persisted else True
    model = persisted.model if persisted else settings.openai_model
    base_url = persisted.base_url if persisted else settings.openai_base_url

    if persisted and persisted.has_api_key:
        api_key = _read_full_api_key(gateway) or settings.openai_api_key
    else:
        api_key = settings.openai_api_key

    return ResolvedAISettings(
        provider=provider,
        enabled=enabled,
        model=model,
        base_url=base_url,
        api_key=api_key or "",
    )


def _read_full_api_key(repository: RepositoryGateway) -> str | None:
    detail = repository.get_system_ai_settings()
    if not detail or not detail.has_api_key:
        return None
    return detail.api_key or None


def mask_api_key(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 8:
        return "*" * len(value)
    return f"{value[:4]}...{value[-4:]}"


def build_system_ai_settings_detail(
    *,
    provider: str,
    enabled: bool,
    model: str,
    base_url: str | None,
    api_key: str | None,
    updated_at,
    updated_by: str | None,
) -> SystemAISettingsDetail:
    detail = SystemAISettingsDetail(
        provider="openai" if provider != "openai" else provider,
        enabled=enabled,
        model=model,
        base_url=base_url,
        api_key=api_key or None,
        has_api_key=bool(api_key),
        masked_api_key=mask_api_key(api_key),
        updated_at=updated_at,
        updated_by=updated_by if updated_by in {"manager", "salesperson"} else None,
    )
    return detail


def list_available_models(
    *,
    settings: Settings,
    repository: RepositoryGateway | None = None,
) -> SystemAIModelListResponse:
    runtime = resolve_ai_settings(settings=settings, repository=repository)
    if not runtime.api_key:
        return SystemAIModelListResponse(items=FALLBACK_MODELS, provider="openai", source="fallback")

    client = OpenAI(api_key=runtime.api_key, base_url=runtime.base_url or None)
    try:
        response = client.models.list()
        ids = sorted(
            {
                str(item.id)
                for item in response.data
                if _is_supported_text_model(str(item.id))
            }
        )
        if ids:
            return SystemAIModelListResponse(items=ids, provider="openai", source="live")
    except Exception:
        pass

    return SystemAIModelListResponse(items=FALLBACK_MODELS, provider="openai", source="fallback")


def _is_supported_text_model(model_id: str) -> bool:
    prefixes = ("gpt-", "o1", "o3", "o4")
    blocked_fragments = ("audio", "transcribe", "tts", "realtime", "image", "embedding", "moderation")
    lowered = model_id.lower()
    if any(fragment in lowered for fragment in blocked_fragments):
        return False
    return lowered.startswith(prefixes)
