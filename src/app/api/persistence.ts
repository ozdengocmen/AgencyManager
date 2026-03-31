import { requestJson, toQueryString } from "./client";
import type {
  DailyPlanRecord,
  DailyPlanSaveRequest,
  MeetingOutcomeLogRequest,
  MeetingOutcomeRecord,
  MeetingPrepRecord,
  MeetingPrepSaveRequest,
  TaskCreateRequest,
  TaskListResponse,
} from "./types";

export function saveDailyPlan(payload: DailyPlanSaveRequest): Promise<DailyPlanRecord> {
  return requestJson<DailyPlanRecord>("/api/tools/persistence/daily-plan", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveMeetingPrep(payload: MeetingPrepSaveRequest): Promise<MeetingPrepRecord> {
  return requestJson<MeetingPrepRecord>("/api/tools/persistence/meeting-prep", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logMeetingOutcome(
  payload: MeetingOutcomeLogRequest,
): Promise<MeetingOutcomeRecord> {
  return requestJson<MeetingOutcomeRecord>("/api/tools/persistence/meeting-outcome", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createTasks(payload: TaskCreateRequest): Promise<TaskListResponse> {
  return requestJson<TaskListResponse>("/api/tools/persistence/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

interface ListTasksParams {
  assignee?: "manager" | "salesperson";
  status?: "pending" | "in-progress" | "completed";
  agency_id?: string;
}

export function listTasks(params: ListTasksParams = {}): Promise<TaskListResponse> {
  const query = toQueryString({
    assignee: params.assignee,
    status: params.status,
    agency_id: params.agency_id,
  });

  return requestJson<TaskListResponse>(`/api/tools/persistence/tasks${query}`);
}
