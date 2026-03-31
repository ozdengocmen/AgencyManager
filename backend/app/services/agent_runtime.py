def get_agent_runtime_info() -> dict[str, str]:
    """Runtime metadata for the currently implemented agent stack."""
    return {
        "provider": "openai",
        "api": "responses",
        "orchestration": "pydantic-ai",
        "status": "meeting-prep-daily-plan-post-meeting-ready",
        "endpoint": "/api/agent/meeting-prep,/api/agent/daily-plan,/api/agent/post-meeting-review",
    }


def get_agent_runtime_contracts() -> list[str]:
    """Return contract names available for strict structured outputs."""
    from backend.app.services.structured_outputs import list_contracts

    return list_contracts()
