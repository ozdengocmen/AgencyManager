import { requestJson } from "./client";
import type {
  AgentRunTraceResponse,
  DailyPlanRequest,
  DailyPlanResponse,
  MeetingPrepRequest,
  MeetingPrepResponse,
} from "./types";

export function generateMeetingPrep(
  payload: MeetingPrepRequest,
): Promise<MeetingPrepResponse> {
  return requestJson<MeetingPrepResponse>("/api/agent/meeting-prep", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateDailyPlan(payload: DailyPlanRequest): Promise<DailyPlanResponse> {
  return requestJson<DailyPlanResponse>("/api/agent/daily-plan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAgentRunTrace(runId: string): Promise<AgentRunTraceResponse> {
  return requestJson<AgentRunTraceResponse>(`/api/agent/runs/${encodeURIComponent(runId)}`);
}
