import type { Tone, UserRole } from "../api/types";
import type { DailyPlanVisit, Task } from "../data/mockData";
import type { MutationMap, MutationStatus } from "./mutations";

export type AppLanguage = "en" | "tr";
export type SessionStatus = "bootstrapping" | "authenticated" | "anonymous";
export type MeetingPrepLength = "short" | "medium" | "long";
export type VisitOutcome = "unknown" | "success" | "neutral" | "risk";
export type PlannerRouteRecalculationReason = "manual" | "visit-completed" | null;
export type AssistantMessageRole = "user" | "assistant";
export type AssistantActionType = "meeting-prep" | "daily-plan";
export type MeetingObjective = "renewal" | "claims" | "cross-sell" | "relationship";
export type SalespersonId = "salesperson" | "manager";
export type RecommendationSource = "ai_generated" | "peer_enriched" | "manager_override";
export type RecommendationDecisionStatus = "proposed" | "accepted" | "modified" | "rejected";
export type RecommendationEffectiveness = "effective" | "ineffective" | "inconclusive";
export type ValidationReason = "data_issue" | "context_mismatch" | "execution_failure";
export type RecommendationConsistency = "match" | "mismatch";
export type MeetingExpectedKpi =
  | "renewal_rate"
  | "claims_ratio"
  | "yoy_growth_motor"
  | "yoy_growth_home"
  | "yoy_growth_health"
  | "overall_health_score";

export interface MeetingBaselineKpis {
  renewal_rate: number;
  claims_ratio: number;
  yoy_growth_motor: number;
  yoy_growth_home: number;
  yoy_growth_health: number;
  overall_health_score: number;
}

export interface MeetingRecord {
  id: string;
  date: string;
  agency_id: string;
  salesperson_id: SalespersonId;
  objective: MeetingObjective;
  baseline_kpis: MeetingBaselineKpis;
}

export interface PreMeetingBrief {
  id: string;
  meeting_id: string;
  agency_id: string;
  created_by: SalespersonId;
  key_points: string[];
  recommendation_ids: string[];
  generated_at: string;
}

export interface Recommendation {
  id: string;
  meeting_id: string;
  agency_id: string;
  text: string;
  source: RecommendationSource;
  rationale: string;
  expected_kpi: MeetingExpectedKpi;
  expected_window_days: number;
  confidence: number;
}

export interface RecommendationDecision {
  id: string;
  recommendation_id: string;
  meeting_id: string;
  agency_id: string;
  decision: RecommendationDecisionStatus;
  reason: string;
  edited_text?: string;
  decided_by: SalespersonId;
  decided_at: string;
}

export interface PostMeetingReport {
  id: string;
  meeting_id: string;
  agency_id: string;
  discussion_summary: string;
  commitments: string[];
  deviations: string[];
  recommendation_consistency: Record<string, RecommendationConsistency>;
  ai_critique: string;
  linked_outcome_ids: string[];
  created_by: SalespersonId;
  created_at: string;
}

export interface RecommendationOutcome {
  id: string;
  recommendation_id: string;
  meeting_id: string;
  agency_id: string;
  baseline_value: number;
  t_plus_7_delta: number;
  t_plus_30_delta: number;
  effectiveness: RecommendationEffectiveness;
  assessed_at: string;
  linked_report_id: string | null;
}

export interface ValidationFlag {
  id: string;
  recommendation_id: string;
  meeting_id: string;
  agency_id: string;
  reason: ValidationReason;
  reviewer_id: SalespersonId;
  notes: string;
  created_at: string;
}

export interface MeetingFlowDraftState {
  meetings: MeetingRecord[];
  pre_meeting_briefs: PreMeetingBrief[];
  recommendations: Recommendation[];
  recommendation_decisions: RecommendationDecision[];
  post_meeting_reports: PostMeetingReport[];
  recommendation_outcomes: RecommendationOutcome[];
  validation_flags: ValidationFlag[];
  selected_meeting_id: string | null;
  updated_at: string | null;
}

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
}

export interface AssistantTraceSummary {
  runId: string;
  provider: string;
  model: string;
  toolsUsed: string[];
  warnings: string[];
}

export interface AssistantPendingAction {
  type: AssistantActionType;
  prompt: string;
  agencyId: string | null;
  preview: string;
}

export interface AssistantState {
  messages: AssistantMessage[];
  draftInput: string;
  lastPrompt: string;
  lastTrace: AssistantTraceSummary | null;
  lastEvidenceMap: Record<string, string[]>;
  lastError: string | null;
  showTraceDetails: boolean;
  pendingAction: AssistantPendingAction | null;
  mobileOpen: boolean;
}

export interface SessionUser {
  id: UserRole;
  role: UserRole;
  name: string;
  email: string;
  portfolioScope: string;
}

export interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  token: string | null;
  language: AppLanguage;
  sessionExpiry: string | null;
}

export interface SettingsState {
  language: AppLanguage;
  defaultTone: Tone;
  maxVisitsPerDay: number;
  maxTravelHours: number;
  avgVisitMinutes: number;
  startLocation: "office" | "home" | "manual";
  startTime: string;
  endTime: string;
  includeBenchmarks: boolean;
  autoGenerateMeetingNotes: boolean;
  priorityNotifications: boolean;
  visitReminders: boolean;
  taskDueAlerts: boolean;
  performanceAlerts: boolean;
}

export interface VisitChecklist {
  reviewKpis: boolean;
  prepareTalkingPoints: boolean;
  reviewLastNotes: boolean;
}

export interface PlannerAutosave {
  status: MutationStatus;
  error: string | null;
  lastSavedAt: string | null;
  lastPlanId: string | null;
}

export interface PlannerRouteState {
  visitedVisitIds: string[];
  routeRevision: number;
  lastRecalculatedAt: string | null;
  lastRecalculationReason: PlannerRouteRecalculationReason;
}

export interface PlannerDraftState {
  visits: DailyPlanVisit[];
  selectedVisitId: string | null;
  filterPreset: string;
  searchQuery: string;
  checklistByVisit: Record<string, VisitChecklist>;
  outcomesByVisit: Record<string, VisitOutcome>;
  autosave: PlannerAutosave;
  route: PlannerRouteState;
}

export interface MeetingPrepDraftState {
  selectedAgencyId: string | null;
  template: string;
  tone: Tone;
  length: MeetingPrepLength;
  includeBenchmarks: boolean;
  generatedOutput: string;
  generatedAt: string | null;
  sourceAgencyId: string | null;
}

export interface TaskWorkspaceState {
  tasks: Task[];
  statusFilter: "all" | "pending" | "in-progress" | "completed";
  priorityFilter: "all" | "high" | "medium" | "low";
  selectedTaskIds: string[];
  userCreatedTaskIds: string[];
  lastSyncedAt: string | null;
}

export interface AppState {
  session: SessionState;
  settings: SettingsState;
  planner: PlannerDraftState;
  meetingPrep: MeetingPrepDraftState;
  meetingFlow: MeetingFlowDraftState;
  tasks: TaskWorkspaceState;
  assistant: AssistantState;
  mutations: MutationMap;
}
