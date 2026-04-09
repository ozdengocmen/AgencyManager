import { requestJson } from "./client";
import type {
  SystemAIModelListResponse,
  SystemAISettingsDetail,
  SystemAISettingsUpdateRequest,
} from "./types";

export function getSystemAISettings(): Promise<SystemAISettingsDetail> {
  return requestJson<SystemAISettingsDetail>("/api/workflows/system/ai-settings");
}

export function updateSystemAISettings(
  payload: SystemAISettingsUpdateRequest,
): Promise<SystemAISettingsDetail> {
  return requestJson<SystemAISettingsDetail>("/api/workflows/system/ai-settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getSystemAIModels(): Promise<SystemAIModelListResponse> {
  return requestJson<SystemAIModelListResponse>("/api/workflows/system/ai-models");
}
