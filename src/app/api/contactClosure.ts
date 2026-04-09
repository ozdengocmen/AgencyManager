import { requestJson, toQueryString } from "./client";
import type {
  ContactClosureCreateRequest,
  ContactClosureDetail,
  ContactClosureValidationRequest,
  ContactClosureValidationResult,
} from "./types";

export function validateContactClosure(
  payload: ContactClosureValidationRequest,
): Promise<ContactClosureValidationResult> {
  return requestJson<ContactClosureValidationResult>("/api/workflows/contact-closures/validate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createContactClosure(
  payload: ContactClosureCreateRequest,
): Promise<ContactClosureDetail> {
  return requestJson<ContactClosureDetail>("/api/workflows/contact-closures", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listContactClosures(
  agencyId: string,
): Promise<{ items: ContactClosureDetail[]; total: number }> {
  return requestJson<{ items: ContactClosureDetail[]; total: number }>(
    `/api/workflows/contact-closures${toQueryString({ agency_id: agencyId })}`,
  );
}
