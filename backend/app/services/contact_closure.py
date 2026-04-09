"""Validation, normalization, and AI-assisted summarization for contact closure notes."""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from typing import TYPE_CHECKING, Any

from openai import OpenAI

from backend.app.core.config import Settings, get_settings
from backend.app.schemas.workflows import ContactClosureAnalysisOutput
from backend.app.services.ai_settings import ResolvedAISettings, resolve_ai_settings
from backend.app.services.structured_outputs import (
    get_responses_api_format,
    validate_contract_output,
)

if TYPE_CHECKING:
    from backend.app.repositories.contracts import RepositoryGateway


GENERIC_PATTERNS = [
    "gorusme yaptik",
    "durum degerlendirdik",
    "genel degerlendirme yapildi",
    "bilgi verildi",
    "meeting held",
    "reviewed the situation",
    "general discussion",
]

ACTION_HINTS = [
    "aksiyon",
    "takip",
    "ilet",
    "kontrol et",
    "gonder",
    "paylas",
    "planla",
    "aranacak",
    "ziyaret",
    "action",
    "follow up",
    "send",
    "share",
    "review",
    "check",
    "schedule",
]

DEPARTMENT_KEYWORDS = {
    "technical": ["teknik", "underwriting", "teklif", "teminat", "poli", "policy"],
    "collections": ["tahsilat", "odeme", "vade", "borc", "collections", "payment"],
    "claims": ["hasar", "eksper", "dosya", "claim", "claims"],
}

TOPIC_KEYWORDS = {
    "renewal": ["yenileme", "renewal"],
    "claims": ["hasar", "claim", "claims"],
    "collections": ["tahsilat", "payment", "collections"],
    "technical": ["teknik", "teklif", "underwriting"],
    "growth": ["uretim", "buyume", "cross-sell", "growth"],
    "relationship": ["iliski", "ziyaret", "memnuniyet", "relationship"],
}


def validate_contact_closure_note(
    *,
    raw_note: str,
    contact_reason: str,
    input_mode: str,
    settings: Settings | None = None,
    repository: RepositoryGateway | None = None,
) -> dict[str, object]:
    normalized = normalize_note(raw_note)
    sentences = split_sentences(normalized)
    lowered = simplify_text(normalized)
    action_items = extract_action_items(sentences)
    rejection_reasons = build_rejection_reasons(
        normalized=normalized,
        sentences=sentences,
        lowered=lowered,
        action_items=action_items,
    )

    fallback_result = {
        "summary": build_summary(sentences, contact_reason),
        "key_points": sentences[:4],
        "action_items": action_items,
        "next_steps": action_items[:3],
        "topics": extract_topics(lowered),
        "department_notes": extract_department_notes(sentences),
    }

    provider = "local-fallback"
    model = "local-fallback-v1"
    warnings: list[str] = []
    analysis = fallback_result

    runtime = resolve_ai_settings(settings=settings or get_settings(), repository=repository)
    if runtime.enabled and runtime.api_key and len(normalized) >= 40:
        try:
            analysis = _generate_ai_analysis(
                runtime=runtime,
                raw_note=normalized,
                contact_reason=contact_reason,
                input_mode=input_mode,
            )
            provider = "openai"
            model = runtime.model
        except Exception as exc:  # pragma: no cover - resilience path
            error_detail = str(exc).strip() or "no error detail"
            warnings.append(
                "OpenAI summarization failed "
                f"({exc.__class__.__name__}: {error_detail}); used local fallback."
            )

    quality_score = calculate_quality_score(
        normalized=normalized,
        sentences=sentences,
        action_items=analysis["action_items"],
        rejection_reasons=rejection_reasons,
        input_mode=input_mode,
        used_openai=provider == "openai",
    )

    return {
        "is_valid": len(rejection_reasons) == 0,
        "quality_score": quality_score,
        "rejection_reasons": rejection_reasons,
        "normalized_note": normalized,
        "summary": analysis["summary"],
        "key_points": analysis["key_points"],
        "action_items": analysis["action_items"],
        "next_steps": analysis["next_steps"],
        "topics": analysis["topics"],
        "department_notes": analysis["department_notes"],
        "validator_version": "openai-rules-v2" if provider == "openai" else "rules-v2",
        "provider": provider,
        "model": model,
        "warnings": warnings,
    }


def build_rejection_reasons(
    *,
    normalized: str,
    sentences: list[str],
    lowered: str,
    action_items: list[str],
) -> list[str]:
    rejection_reasons: list[str] = []

    if len(normalized) < 40:
        rejection_reasons.append(
            "Note is too short. Add what was discussed, what action was agreed, and what happens next."
        )

    if len(sentences) < 2:
        rejection_reasons.append(
            "Note must contain at least two meaningful sentences or bullet-like statements."
        )

    generic_hits = [pattern for pattern in GENERIC_PATTERNS if pattern in lowered]
    if generic_hits and _should_reject_as_generic(
        normalized=normalized,
        sentences=sentences,
        action_items=action_items,
    ):
        rejection_reasons.append(
            "Note is too generic. Generic phrases like 'we met and evaluated the situation' are not enough."
        )

    if not action_items:
        rejection_reasons.append(
            "Add at least one concrete action, commitment, or follow-up item."
        )

    return rejection_reasons


def normalize_note(raw_note: str) -> str:
    compact = raw_note.replace("\r", "\n").strip()
    compact = re.sub(r"[ \t]+", " ", compact)
    compact = re.sub(r"\n{2,}", "\n", compact)
    return compact


def simplify_text(value: str) -> str:
    lowered = value.lower()
    normalized = unicodedata.normalize("NFKD", lowered)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9\s]", " ", ascii_only)


def split_sentences(value: str) -> list[str]:
    candidates = re.split(r"(?:[\.\!\?]\s+|\n+|•|- )", value)
    return [item.strip(" -•") for item in candidates if item and item.strip(" -•")]


def extract_action_items(sentences: list[str]) -> list[str]:
    actions: list[str] = []
    for sentence in sentences:
        lowered = simplify_text(sentence)
        if any(hint in lowered for hint in ACTION_HINTS):
            actions.append(sentence)
            continue
        if re.search(r"\b(yapilacak|yapacagiz|planlandi|iletilecek|kontrol edilecek)\b", lowered):
            actions.append(sentence)
    return actions[:5]


def build_summary(sentences: list[str], contact_reason: str) -> str:
    if not sentences:
        return ""
    lead = f"Contact reason: {contact_reason}. " if contact_reason else ""
    return f"{lead}{' '.join(sentences[:2])}".strip()


def extract_department_notes(sentences: list[str]) -> dict[str, list[str]]:
    notes: dict[str, list[str]] = defaultdict(list)
    for sentence in sentences:
        lowered = simplify_text(sentence)
        for department, keywords in DEPARTMENT_KEYWORDS.items():
            if any(keyword in lowered for keyword in keywords):
                notes[department].append(sentence)
    return {
        "technical": notes.get("technical", []),
        "collections": notes.get("collections", []),
        "claims": notes.get("claims", []),
    }


def extract_topics(lowered: str) -> list[str]:
    topics: list[str] = []
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            topics.append(topic)
    return topics or ["general"]


def calculate_quality_score(
    *,
    normalized: str,
    sentences: list[str],
    action_items: list[str],
    rejection_reasons: list[str],
    input_mode: str,
    used_openai: bool,
) -> int:
    score = 35
    score += min(len(normalized) // 12, 25)
    score += min(len(sentences) * 6, 18)
    score += min(len(action_items) * 8, 16)
    if input_mode == "speech":
        score += 3
    if used_openai:
        score += 4
    score -= len(rejection_reasons) * 18
    return max(0, min(score, 100))


def _should_reject_as_generic(
    *,
    normalized: str,
    sentences: list[str],
    action_items: list[str],
) -> bool:
    if action_items:
        return False
    if len(normalized) >= 100 and len(sentences) >= 3:
        return False
    return True


def _generate_ai_analysis(
    *,
    runtime: ResolvedAISettings,
    raw_note: str,
    contact_reason: str,
    input_mode: str,
) -> dict[str, Any]:
    client = OpenAI(api_key=runtime.api_key, base_url=runtime.base_url or None)
    response = client.responses.create(
        model=runtime.model,
        input=[
            {"role": "system", "content": _system_prompt()},
            {
                "role": "user",
                "content": (
                    f"contact_reason={contact_reason}\n"
                    f"input_mode={input_mode}\n"
                    "raw_note:\n"
                    f"{raw_note}"
                ),
            },
        ],
        text={"format": get_responses_api_format("ContactClosureAnalysisOutput")},
    )
    payload = _extract_output_json(response)
    validated = validate_contract_output("ContactClosureAnalysisOutput", payload)
    analysis = ContactClosureAnalysisOutput.model_validate(validated.model_dump(mode="json"))
    return analysis.model_dump(mode="json")


def _extract_output_json(response: Any) -> dict[str, Any]:
    output_parsed = _read(response, "output_parsed")
    if isinstance(output_parsed, dict):
        return output_parsed

    output_text = _read(response, "output_text")
    if isinstance(output_text, str) and output_text.strip():
        return _parse_json_object(output_text)

    for item in _read(response, "output", []) or []:
        if _read(item, "type") != "message":
            continue
        for content in _read(item, "content", []) or []:
            text = _read(content, "text") or _read(content, "value") or ""
            if text:
                return _parse_json_object(str(text))
    raise ValueError("Could not extract JSON output from response")


def _parse_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
    parsed = json.loads(cleaned)
    if not isinstance(parsed, dict):
        raise ValueError("Expected JSON object output")
    return parsed


def _read(item: Any, key: str, default: Any = None) -> Any:
    if isinstance(item, dict):
        return item.get(key, default)
    return getattr(item, key, default)


def _system_prompt() -> str:
    return (
        "You are an insurance sales assistant that converts post-visit notes into a clean structured summary. "
        "Keep the output in the same language as the input note. "
        "Do not invent facts that are not in the note. "
        "Rewrite messy speech transcripts into concise, professional wording. "
        "Action items and next steps must be concrete. "
        "Department notes must only include items clearly relevant to technical, collections, or claims. "
        "Return only JSON matching the provided schema."
    )
