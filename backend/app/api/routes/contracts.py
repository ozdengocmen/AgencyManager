"""Phase 5 contract discovery and validation routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from backend.app.schemas.contracts import (
    ContractListResponse,
    ContractSchemaResponse,
    ContractValidateRequest,
    ContractValidateResponse,
)
from backend.app.services.structured_outputs import (
    get_contract_json_schema,
    list_contracts,
    validate_contract_output,
)

router = APIRouter()


@router.get("", response_model=ContractListResponse)
def contracts() -> ContractListResponse:
    return ContractListResponse(contracts=list_contracts())


@router.get("/{contract}/schema", response_model=ContractSchemaResponse)
def contract_schema(contract: str) -> ContractSchemaResponse:
    try:
        return ContractSchemaResponse(
            contract=contract,
            json_schema=get_contract_json_schema(contract),
        )
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{contract}/validate", response_model=ContractValidateResponse)
def validate(contract: str, payload: ContractValidateRequest) -> ContractValidateResponse:
    try:
        validated = validate_contract_output(contract, payload.payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc

    return ContractValidateResponse(
        contract=contract,
        validated_output=validated.model_dump(mode="json"),
    )
