import { requestJson, toQueryString } from "./client";
import type { UserRole } from "./types";

export interface DailyPlanWorkflowRecord {
  plan_id: string;
  user_id: UserRole;
  plan_date: string;
  plan_json: Record<string, unknown>;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export function createWorkflowDailyPlan(payload: {
  plan_date: string;
  plan_json: Record<string, unknown>;
  user_id?: UserRole;
}): Promise<DailyPlanWorkflowRecord> {
  const query = toQueryString({ user_id: payload.user_id });
  return requestJson<DailyPlanWorkflowRecord>(`/api/workflows/daily-plans${query}`, {
    method: "POST",
    body: JSON.stringify({
      plan_date: payload.plan_date,
      plan_json: payload.plan_json,
    }),
  });
}

export function updateWorkflowDailyPlan(payload: {
  plan_id: string;
  plan_json: Record<string, unknown>;
  user_id?: UserRole;
}): Promise<DailyPlanWorkflowRecord> {
  const query = toQueryString({ user_id: payload.user_id });
  return requestJson<DailyPlanWorkflowRecord>(`/api/workflows/daily-plans/${payload.plan_id}${query}`, {
    method: "PATCH",
    body: JSON.stringify({
      plan_json: payload.plan_json,
    }),
  });
}

export function getCurrentWorkflowDailyPlan(params: {
  plan_date: string;
  user_id?: UserRole;
}): Promise<DailyPlanWorkflowRecord> {
  const query = toQueryString({
    plan_date: params.plan_date,
    user_id: params.user_id,
  });
  return requestJson<DailyPlanWorkflowRecord>(`/api/workflows/daily-plans/current${query}`);
}
