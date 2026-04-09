"""Structured output contract registry and validators."""

from __future__ import annotations

import json
from typing import Any

from pydantic import BaseModel, TypeAdapter

from backend.app.schemas.agent_outputs import (
    ClusterPlan,
    DailyVisitPlan,
    MeetingNarrative,
    PostMeetingAnalysis,
    TaskList,
)
from backend.app.schemas.workflows import ContactClosureAnalysisOutput

ContractName = str

_CONTRACT_MODELS: dict[ContractName, type[BaseModel]] = {
    "ContactClosureAnalysisOutput": ContactClosureAnalysisOutput,
    "MeetingNarrative": MeetingNarrative,
    "PostMeetingAnalysis": PostMeetingAnalysis,
    "DailyVisitPlan": DailyVisitPlan,
    "ClusterPlan": ClusterPlan,
    "TaskList": TaskList,
}


def list_contracts() -> list[str]:
    return sorted(_CONTRACT_MODELS.keys())


def get_contract_model(contract: str) -> type[BaseModel]:
    model = _CONTRACT_MODELS.get(contract)
    if model is None:
        raise KeyError(f"Unknown contract '{contract}'")
    return model


def get_contract_json_schema(contract: str) -> dict[str, Any]:
    model = get_contract_model(contract)
    schema = model.model_json_schema()
    _enforce_required_object_properties(schema)
    return schema


def get_responses_api_format(contract: str) -> dict[str, Any]:
    """OpenAI Responses API-compatible `text.format` block."""
    return {
        "type": "json_schema",
        "name": contract,
        "strict": True,
        "schema": get_contract_json_schema(contract),
    }


def validate_contract_output(contract: str, payload: dict[str, Any]) -> BaseModel:
    model = get_contract_model(contract)
    return TypeAdapter(model).validate_python(payload)


def parse_and_validate_contract_output(contract: str, payload_json: str) -> BaseModel:
    parsed = json.loads(payload_json)
    if not isinstance(parsed, dict):
        raise ValueError("Structured output must be a JSON object")
    return validate_contract_output(contract, parsed)


def _enforce_required_object_properties(node: Any) -> None:
    if isinstance(node, dict):
        properties = node.get("properties")
        if isinstance(properties, dict):
            node["required"] = list(properties.keys())
            node["additionalProperties"] = False
            for property_schema in properties.values():
                _enforce_required_object_properties(property_schema)

        items = node.get("items")
        if items is not None:
            _enforce_required_object_properties(items)

        defs = node.get("$defs")
        if isinstance(defs, dict):
            for schema in defs.values():
                _enforce_required_object_properties(schema)

        for key in ("anyOf", "allOf", "oneOf", "prefixItems"):
            candidate = node.get(key)
            if isinstance(candidate, list):
                for schema in candidate:
                    _enforce_required_object_properties(schema)
        return

    if isinstance(node, list):
        for item in node:
            _enforce_required_object_properties(item)
