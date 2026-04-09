export type UserRole = "manager" | "salesperson";
export type OutputLanguage = "en" | "tr";
export type Tone = "friendly" | "consultative" | "assertive";
export type Goal = "renewal" | "claims" | "cross-sell" | "relationship";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AgendaItem {
  order: number;
  topic: string;
  objective: string;
  duration_minutes: number;
}

export interface RiskItem {
  title: string;
  severity: "high" | "medium" | "low";
  explanation: string;
  linked_metrics: string[];
  mitigation_actions: string[];
}

export interface OpportunityItem {
  branch: "motor" | "home" | "health";
  title: string;
  rationale: string;
  suggested_actions: string[];
}

export interface MetricQuote {
  metric_key: string;
  agency_value: number;
  benchmark_value: number | null;
  delta_vs_benchmark: number | null;
  quote_text: string;
}

export interface MeetingNarrative {
  agency_id: string;
  language: OutputLanguage;
  tone: Tone;
  generated_at: string;
  opening_context: string;
  talk_track: string[];
  agenda: AgendaItem[];
  questions_to_ask: string[];
  risks: RiskItem[];
  opportunities: OpportunityItem[];
  commitments_next_steps: string[];
  metric_quotes: MetricQuote[];
  missing_data_notes: string[];
}

export interface MeetingPrepRequest {
  agency_id: string;
  user_id?: UserRole;
  language?: OutputLanguage;
  tone?: Tone;
  additional_context?: string;
  save_result?: boolean;
}

export interface MeetingPrepResponse {
  narrative: MeetingNarrative;
  provider: "openai" | "local-fallback";
  model: string;
  tools_used: string[];
  run_id: string;
  trace_summary: AgentTraceSummary;
  evidence_map: Record<string, string[]>;
  saved_prep_id: string | null;
  warnings: string[];
}

export interface DailyVisitPlanItem {
  order: number;
  agency_id: string;
  agency_name: string;
  city: string;
  district: string;
  goal: Goal;
  time_window: string;
  objective: string;
  rationale: string[];
  estimated_travel_minutes_from_previous: number;
  estimated_distance_km_from_previous: number;
}

export interface DailyVisitPlanSummary {
  total_visits: number;
  total_distance_km: number;
  total_travel_minutes: number;
  optimization_notes: string[];
}

export interface DailyVisitPlan {
  user_id: UserRole;
  plan_date: string;
  start: Coordinates;
  visits: DailyVisitPlanItem[];
  summary: DailyVisitPlanSummary;
}

export interface DailyPlanRequest {
  user_id?: UserRole;
  plan_date?: string;
  language?: OutputLanguage;
  sales_owner?: string;
  city?: string;
  max_visits?: number;
  cluster_count?: number;
  start?: Coordinates;
  save_result?: boolean;
}

export interface DailyPlanResponse {
  plan: DailyVisitPlan;
  provider: "openai" | "local-fallback";
  model: string;
  tools_used: string[];
  run_id: string;
  trace_summary: AgentTraceSummary;
  evidence_map: Record<string, string[]>;
  saved_plan_id: string | null;
  warnings: string[];
}

export interface AgentTraceEvent {
  event_type:
    | "model_call_start"
    | "model_call_end"
    | "tool_call"
    | "contract_validation"
    | "fallback";
  status: "ok" | "warning" | "error";
  message: string;
  timestamp: string;
}

export interface AgentTraceSummary {
  run_id: string;
  tools_used: string[];
  warnings: string[];
  events: AgentTraceEvent[];
}

export interface AgentRunMetadata {
  run_id: string;
  agent_name: string;
  request_json: Record<string, unknown>;
  provider: string;
  model: string;
  status: string;
  fallback_reason: string | null;
  warnings: string[];
  response_id: string | null;
  started_at: string;
  ended_at: string | null;
}

export interface AgentToolCallMetadata {
  run_id: string;
  step_no: number;
  tool_name: string;
  arguments_json: Record<string, unknown>;
  output_json: Record<string, unknown>;
  status: string;
  error: string | null;
  duration_ms: number;
}

export interface AgentRunTraceResponse {
  run: AgentRunMetadata;
  tool_calls: AgentToolCallMetadata[];
}

export type AgencyListSort =
  | "priority_desc"
  | "next_visit_asc"
  | "health_desc"
  | "renewal_risk_first";

export interface Agency {
  agency_id: string;
  agency_name: string;
  address_text: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  sales_owner: string;
  priority_tier: "A" | "B" | "C";
  target_visit_frequency: "weekly" | "monthly" | "quarterly";
  preferred_visit_time_window: "morning" | "afternoon" | "any";
  last_visit_date: string;
  next_recommended_visit_date: string;
}

export interface AgencyKpi {
  agency_id: string;
  premiums_written_total: number;
  total_revenue: number;
  claims_total: number;
  portfolio_concentration: number;
  renewal_rate: number;
  yoy_growth_motor: number;
  yoy_growth_home: number;
  yoy_growth_health: number;
  claims_ratio: number;
  overall_health_score: number;
  renewal_risk_flag: boolean;
  growth_best_branch: "motor" | "home" | "health";
  growth_worst_branch: "motor" | "home" | "health";
}

export interface AgencyListItem {
  agency: Agency;
  kpi: AgencyKpi;
}

export interface AgencyListResponse {
  items: AgencyListItem[];
  total: number;
}

export interface AgencyProfileResponse {
  agency: Agency;
  kpi: AgencyKpi;
  benchmarks: {
    benchmark_key: string;
    avg_renewal_rate: number;
    avg_claims_ratio: number;
    avg_overall_health_score: number;
    avg_yoy_growth_motor: number;
    avg_yoy_growth_home: number;
    avg_yoy_growth_health: number;
  };
}

export interface PortfolioSummaryResponse {
  owner: string | null;
  agency_count: number;
  total_premiums_written: number;
  total_revenue: number;
  total_claims: number;
  avg_renewal_rate: number;
  avg_claims_ratio: number;
  avg_overall_health_score: number;
  renewal_risk_agencies: number;
  benchmark_delta_renewal_rate: number;
  benchmark_delta_claims_ratio: number;
}

export interface DailyPlanSaveRequest {
  user_id: UserRole;
  date: string;
  plan_json: Record<string, unknown>;
}

export interface DailyPlanRecord extends DailyPlanSaveRequest {
  plan_id: string;
  created_at: string;
}

export interface MeetingPrepSaveRequest {
  agency_id: string;
  narrative_json: Record<string, unknown>;
}

export interface MeetingPrepRecord extends MeetingPrepSaveRequest {
  prep_id: string;
  created_at: string;
}

export interface MeetingOutcomeLogRequest {
  agency_id: string;
  outcome: string;
  notes?: string;
  next_steps?: string[];
}

export interface MeetingOutcomeRecord extends Required<MeetingOutcomeLogRequest> {
  outcome_id: string;
  created_at: string;
}

export type ContactClosureInputMode = "manual" | "speech";

export interface ContactClosureValidationRequest {
  agency_id: string;
  contact_reason: string;
  input_mode: ContactClosureInputMode;
  raw_note: string;
}

export interface ContactClosureDepartmentNotes {
  technical: string[];
  collections: string[];
  claims: string[];
}

export interface ContactClosureValidationResult {
  is_valid: boolean;
  quality_score: number;
  rejection_reasons: string[];
  normalized_note: string;
  summary: string;
  key_points: string[];
  action_items: string[];
  next_steps: string[];
  topics: string[];
  department_notes: ContactClosureDepartmentNotes;
  validator_version: string;
  provider: "openai" | "local-fallback";
  model: string;
  warnings: string[];
}

export interface ContactClosureCreateRequest extends ContactClosureValidationRequest {}

export interface ContactClosureDetail {
  closure_id: string;
  user_id: UserRole;
  agency_id: string;
  contact_reason: string;
  input_mode: ContactClosureInputMode;
  raw_note: string;
  normalized_note: string;
  summary: string;
  key_points: string[];
  action_items: string[];
  next_steps: string[];
  topics: string[];
  department_notes: ContactClosureDepartmentNotes;
  quality_score: number;
  validation_status: "valid" | "invalid";
  validator_version: string;
  created_at: string;
  validation_result: ContactClosureValidationResult;
}

export interface SystemAISettingsDetail {
  provider: "openai";
  enabled: boolean;
  model: string;
  base_url: string | null;
  api_key: string | null;
  has_api_key: boolean;
  masked_api_key: string | null;
  updated_at: string;
  updated_by: UserRole | null;
}

export interface SystemAISettingsUpdateRequest {
  provider: "openai";
  enabled: boolean;
  model: string;
  base_url?: string | null;
  api_key?: string | null;
  retain_existing_api_key?: boolean;
  clear_api_key?: boolean;
}

export interface SystemAIModelListResponse {
  items: string[];
  provider: "openai";
  source: "live" | "fallback";
}

export interface TaskCreateInput {
  agency_id: string;
  assignee: UserRole;
  title: string;
  description?: string;
  due_date: string;
  priority?: "high" | "medium" | "low";
  status?: "pending" | "in-progress" | "completed";
}

export interface TaskCreateRequest {
  tasks: TaskCreateInput[];
}

export interface PersistenceTaskRecord extends Required<TaskCreateInput> {
  task_id: string;
  created_at: string;
}

export interface TaskListResponse {
  items: PersistenceTaskRecord[];
  total: number;
}
