"""Schemas for contract discovery and validation endpoints."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ContractListResponse(BaseModel):
    contracts: list[str]


class ContractSchemaResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    contract: str
    json_schema: dict[str, Any] = Field(alias="schema")


class ContractValidateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    payload: dict[str, Any] = Field(default_factory=dict)


class ContractValidateResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    contract: str
    validated_output: dict[str, Any]
