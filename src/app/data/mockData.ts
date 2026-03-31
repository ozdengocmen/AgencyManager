// Mock data for the Agency Portfolio Assistant

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

export interface AgencyKPIs {
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

export interface PortfolioBenchmarks {
  benchmark_key: string;
  avg_renewal_rate: number;
  avg_claims_ratio: number;
  avg_overall_health_score: number;
  avg_yoy_growth_motor: number;
  avg_yoy_growth_home: number;
  avg_yoy_growth_health: number;
}

export const mockAgencies: Agency[] = [
  {
    agency_id: "AG001",
    agency_name: "Marmara Sigorta Acenteliği",
    address_text: "Bağdat Caddesi No: 214",
    city: "İstanbul",
    district: "Kadıköy",
    latitude: 40.9717,
    longitude: 29.0703,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "A",
    target_visit_frequency: "weekly",
    preferred_visit_time_window: "morning",
    last_visit_date: "2026-02-25",
    next_recommended_visit_date: "2026-03-08",
  },
  {
    agency_id: "AG002",
    agency_name: "Güven Hayat Sigorta Aracılık",
    address_text: "Halaskargazi Caddesi No: 128",
    city: "İstanbul",
    district: "Şişli",
    latitude: 41.0542,
    longitude: 28.9877,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "A",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "afternoon",
    last_visit_date: "2026-02-10",
    next_recommended_visit_date: "2026-03-05",
  },
  {
    agency_id: "AG003",
    agency_name: "Boğaziçi Sigorta Danışmanlık",
    address_text: "Nispetiye Caddesi No: 92",
    city: "İstanbul",
    district: "Beşiktaş",
    latitude: 41.0778,
    longitude: 29.0113,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "B",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "any",
    last_visit_date: "2026-01-28",
    next_recommended_visit_date: "2026-03-01",
  },
  {
    agency_id: "AG004",
    agency_name: "Anadolu Koruma Sigorta",
    address_text: "Büyükdere Caddesi No: 185",
    city: "İstanbul",
    district: "Levent",
    latitude: 41.0781,
    longitude: 29.0126,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "A",
    target_visit_frequency: "weekly",
    preferred_visit_time_window: "morning",
    last_visit_date: "2026-02-20",
    next_recommended_visit_date: "2026-03-04",
  },
  {
    agency_id: "AG005",
    agency_name: "İstanbul Teminat Acenteliği",
    address_text: "İstiklal Caddesi No: 173",
    city: "İstanbul",
    district: "Beyoğlu",
    latitude: 41.0369,
    longitude: 28.9850,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "B",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "afternoon",
    last_visit_date: "2026-02-05",
    next_recommended_visit_date: "2026-03-10",
  },
  {
    agency_id: "AG006",
    agency_name: "Haliç Sigorta Hizmetleri",
    address_text: "Fevzipaşa Caddesi No: 64",
    city: "İstanbul",
    district: "Fatih",
    latitude: 41.0178,
    longitude: 28.9497,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "C",
    target_visit_frequency: "quarterly",
    preferred_visit_time_window: "any",
    last_visit_date: "2025-12-15",
    next_recommended_visit_date: "2026-03-15",
  },
  {
    agency_id: "AG007",
    agency_name: "Yakut Sigorta Çözümleri",
    address_text: "Alemdağ Caddesi No: 311",
    city: "İstanbul",
    district: "Ümraniye",
    latitude: 41.0244,
    longitude: 29.1244,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "B",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "morning",
    last_visit_date: "2026-02-12",
    next_recommended_visit_date: "2026-03-12",
  },
  {
    agency_id: "AG008",
    agency_name: "Yeni Ufuk Sigorta Merkezi",
    address_text: "Atatürk Bulvarı No: 87",
    city: "İstanbul",
    district: "Başakşehir",
    latitude: 41.0936,
    longitude: 28.8026,
    sales_owner: "Ahmet Yılmaz",
    priority_tier: "A",
    target_visit_frequency: "weekly",
    preferred_visit_time_window: "afternoon",
    last_visit_date: "2026-02-27",
    next_recommended_visit_date: "2026-03-06",
  },
];

export const mockKPIs: Record<string, AgencyKPIs> = {
  AG001: {
    agency_id: "AG001",
    premiums_written_total: 2500000,
    total_revenue: 375000,
    claims_total: 1800000,
    portfolio_concentration: 0.35,
    renewal_rate: 62,
    yoy_growth_motor: 8.5,
    yoy_growth_home: 12.3,
    yoy_growth_health: 5.2,
    claims_ratio: 0.72,
    overall_health_score: 68,
    renewal_risk_flag: true,
    growth_best_branch: "home",
    growth_worst_branch: "health",
  },
  AG002: {
    agency_id: "AG002",
    premiums_written_total: 1850000,
    total_revenue: 295000,
    claims_total: 1250000,
    portfolio_concentration: 0.42,
    renewal_rate: 78,
    yoy_growth_motor: 15.2,
    yoy_growth_home: 9.8,
    yoy_growth_health: 18.5,
    claims_ratio: 0.68,
    overall_health_score: 82,
    renewal_risk_flag: false,
    growth_best_branch: "health",
    growth_worst_branch: "home",
  },
  AG003: {
    agency_id: "AG003",
    premiums_written_total: 980000,
    total_revenue: 147000,
    claims_total: 720000,
    portfolio_concentration: 0.28,
    renewal_rate: 71,
    yoy_growth_motor: 6.5,
    yoy_growth_home: 7.8,
    yoy_growth_health: 4.2,
    claims_ratio: 0.73,
    overall_health_score: 65,
    renewal_risk_flag: false,
    growth_best_branch: "home",
    growth_worst_branch: "health",
  },
  AG004: {
    agency_id: "AG004",
    premiums_written_total: 3200000,
    total_revenue: 512000,
    claims_total: 1920000,
    portfolio_concentration: 0.48,
    renewal_rate: 58,
    yoy_growth_motor: -2.3,
    yoy_growth_home: 3.5,
    yoy_growth_health: 1.8,
    claims_ratio: 0.60,
    overall_health_score: 55,
    renewal_risk_flag: true,
    growth_best_branch: "home",
    growth_worst_branch: "motor",
  },
  AG005: {
    agency_id: "AG005",
    premiums_written_total: 1250000,
    total_revenue: 187500,
    claims_total: 825000,
    portfolio_concentration: 0.22,
    renewal_rate: 85,
    yoy_growth_motor: 22.5,
    yoy_growth_home: 18.9,
    yoy_growth_health: 25.3,
    claims_ratio: 0.66,
    overall_health_score: 92,
    renewal_risk_flag: false,
    growth_best_branch: "health",
    growth_worst_branch: "home",
  },
  AG006: {
    agency_id: "AG006",
    premiums_written_total: 650000,
    total_revenue: 91000,
    claims_total: 485000,
    portfolio_concentration: 0.18,
    renewal_rate: 73,
    yoy_growth_motor: 4.8,
    yoy_growth_home: 6.2,
    yoy_growth_health: 3.9,
    claims_ratio: 0.75,
    overall_health_score: 70,
    renewal_risk_flag: false,
    growth_best_branch: "home",
    growth_worst_branch: "health",
  },
  AG007: {
    agency_id: "AG007",
    premiums_written_total: 1420000,
    total_revenue: 220000,
    claims_total: 1065000,
    portfolio_concentration: 0.38,
    renewal_rate: 67,
    yoy_growth_motor: 10.2,
    yoy_growth_home: 11.5,
    yoy_growth_health: 8.7,
    claims_ratio: 0.75,
    overall_health_score: 72,
    renewal_risk_flag: false,
    growth_best_branch: "home",
    growth_worst_branch: "health",
  },
  AG008: {
    agency_id: "AG008",
    premiums_written_total: 2800000,
    total_revenue: 434000,
    claims_total: 1680000,
    portfolio_concentration: 0.52,
    renewal_rate: 88,
    yoy_growth_motor: 16.8,
    yoy_growth_home: 14.2,
    yoy_growth_health: 19.5,
    claims_ratio: 0.60,
    overall_health_score: 89,
    renewal_risk_flag: false,
    growth_best_branch: "health",
    growth_worst_branch: "home",
  },
};

export const mockBenchmarks: PortfolioBenchmarks = {
  benchmark_key: "Ahmet Yılmaz",
  avg_renewal_rate: 71,
  avg_claims_ratio: 0.68,
  avg_overall_health_score: 74,
  avg_yoy_growth_motor: 10.3,
  avg_yoy_growth_home: 10.5,
  avg_yoy_growth_health: 10.9,
};

export interface Task {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  due_date: string;
  status: "pending" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
}

export const mockTasks: Task[] = [
  {
    id: "T001",
    agency_id: "AG001",
    title: "Address renewal concerns",
    description: "Discuss renewal rate drop with Marmara Sigorta Acenteliği",
    due_date: "2026-03-05",
    status: "pending",
    priority: "high",
  },
  {
    id: "T002",
    agency_id: "AG004",
    title: "Review claims spike",
    description: "Investigate high claims ratio at Anadolu Koruma Sigorta",
    due_date: "2026-03-06",
    status: "pending",
    priority: "high",
  },
  {
    id: "T003",
    agency_id: "AG002",
    title: "Follow up on health branch growth",
    description: "Present cross-sell opportunities for health products",
    due_date: "2026-03-08",
    status: "in-progress",
    priority: "medium",
  },
];

export interface DailyPlanVisit {
  id: string;
  agency_id: string;
  goal: "renewal" | "claims" | "cross-sell" | "relationship";
  time_window: string;
  notes: string;
  order: number;
}

export const mockDailyPlan: DailyPlanVisit[] = [
  {
    id: "V001",
    agency_id: "AG004",
    goal: "renewal",
    time_window: "9:00 AM - 10:00 AM",
    notes: "Focus on addressing declining renewal rates",
    order: 1,
  },
  {
    id: "V002",
    agency_id: "AG001",
    goal: "claims",
    time_window: "10:30 AM - 11:30 AM",
    notes: "Discuss claims ratio concerns",
    order: 2,
  },
  {
    id: "V003",
    agency_id: "AG008",
    goal: "relationship",
    time_window: "2:00 PM - 3:00 PM",
    notes: "Routine check-in with top performer",
    order: 3,
  },
];

export type MeetingObjective = "renewal" | "claims" | "cross-sell" | "relationship";
export type MeetingSalespersonId = "salesperson" | "manager";
export type RecommendationSource = "ai_generated" | "peer_enriched" | "manager_override";
export type RecommendationDecisionStatus = "proposed" | "accepted" | "modified" | "rejected";
export type RecommendationEffectiveness = "effective" | "ineffective" | "inconclusive";
export type ValidationReason = "data_issue" | "context_mismatch" | "execution_failure";
export type ExpectedKpiKey =
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
  salesperson_id: MeetingSalespersonId;
  objective: MeetingObjective;
  baseline_kpis: MeetingBaselineKpis;
}

export interface PreMeetingBriefRecord {
  id: string;
  meeting_id: string;
  agency_id: string;
  created_by: MeetingSalespersonId;
  key_points: string[];
  recommendation_ids: string[];
  generated_at: string;
}

export interface RecommendationRecord {
  id: string;
  meeting_id: string;
  agency_id: string;
  text: string;
  source: RecommendationSource;
  rationale: string;
  expected_kpi: ExpectedKpiKey;
  expected_window_days: number;
  confidence: number;
}

export interface RecommendationDecisionRecord {
  id: string;
  recommendation_id: string;
  meeting_id: string;
  agency_id: string;
  decision: RecommendationDecisionStatus;
  reason: string;
  edited_text?: string;
  decided_by: MeetingSalespersonId;
  decided_at: string;
}

export interface PostMeetingReportRecord {
  id: string;
  meeting_id: string;
  agency_id: string;
  discussion_summary: string;
  commitments: string[];
  deviations: string[];
  recommendation_consistency: Record<string, "match" | "mismatch">;
  ai_critique: string;
  created_by: MeetingSalespersonId;
  created_at: string;
}

export interface RecommendationOutcomeRecord {
  id: string;
  recommendation_id: string;
  meeting_id: string;
  agency_id: string;
  baseline_value: number;
  t_plus_7_delta: number;
  t_plus_30_delta: number;
  effectiveness: RecommendationEffectiveness;
  assessed_at: string;
}

export interface ValidationFlagRecord {
  id: string;
  recommendation_id: string;
  meeting_id: string;
  agency_id: string;
  reason: ValidationReason;
  reviewer_id: MeetingSalespersonId;
  notes: string;
  created_at: string;
}

function buildBaselineKpis(agencyId: string): MeetingBaselineKpis {
  const source = mockKPIs[agencyId];
  return {
    renewal_rate: source.renewal_rate,
    claims_ratio: source.claims_ratio,
    yoy_growth_motor: source.yoy_growth_motor,
    yoy_growth_home: source.yoy_growth_home,
    yoy_growth_health: source.yoy_growth_health,
    overall_health_score: source.overall_health_score,
  };
}

export const mockMeetingRecords: MeetingRecord[] = [
  { id: "MT001", date: "2026-03-03", agency_id: "AG001", salesperson_id: "salesperson", objective: "renewal", baseline_kpis: buildBaselineKpis("AG001") },
  { id: "MT002", date: "2026-03-04", agency_id: "AG002", salesperson_id: "salesperson", objective: "cross-sell", baseline_kpis: buildBaselineKpis("AG002") },
  { id: "MT003", date: "2026-03-05", agency_id: "AG003", salesperson_id: "salesperson", objective: "relationship", baseline_kpis: buildBaselineKpis("AG003") },
  { id: "MT004", date: "2026-03-06", agency_id: "AG004", salesperson_id: "salesperson", objective: "claims", baseline_kpis: buildBaselineKpis("AG004") },
  { id: "MT005", date: "2026-03-10", agency_id: "AG005", salesperson_id: "salesperson", objective: "cross-sell", baseline_kpis: buildBaselineKpis("AG005") },
  { id: "MT006", date: "2026-03-12", agency_id: "AG006", salesperson_id: "salesperson", objective: "relationship", baseline_kpis: buildBaselineKpis("AG006") },
  { id: "MT007", date: "2026-03-13", agency_id: "AG007", salesperson_id: "salesperson", objective: "renewal", baseline_kpis: buildBaselineKpis("AG007") },
  { id: "MT008", date: "2026-03-14", agency_id: "AG008", salesperson_id: "salesperson", objective: "claims", baseline_kpis: buildBaselineKpis("AG008") },
];

export const mockRecommendations: RecommendationRecord[] = [
  {
    id: "REC001",
    meeting_id: "MT001",
    agency_id: "AG001",
    text: "Run a 30-day renewal recovery call list for clients with policy expiry in the next 60 days.",
    source: "ai_generated",
    rationale: "Renewal rate is below benchmark and near-term outreach reduces lapse risk.",
    expected_kpi: "renewal_rate",
    expected_window_days: 30,
    confidence: 0.79,
  },
  {
    id: "REC002",
    meeting_id: "MT001",
    agency_id: "AG001",
    text: "Introduce a claims pre-check checklist before policy issuance for high-risk vehicle classes.",
    source: "peer_enriched",
    rationale: "Peer agencies with lower claims ratio use a structured underwriting checklist.",
    expected_kpi: "claims_ratio",
    expected_window_days: 30,
    confidence: 0.74,
  },
  {
    id: "REC003",
    meeting_id: "MT002",
    agency_id: "AG002",
    text: "Bundle home and health coverage in renewal calls for customers with single-product policies.",
    source: "ai_generated",
    rationale: "Cross-line positioning supports growth while protecting renewal stability.",
    expected_kpi: "yoy_growth_health",
    expected_window_days: 30,
    confidence: 0.83,
  },
  {
    id: "REC004",
    meeting_id: "MT003",
    agency_id: "AG003",
    text: "Pilot monthly portfolio review meetings with branch leads to track conversion bottlenecks.",
    source: "manager_override",
    rationale: "Low consistency in follow-up cadence has slowed growth on key branches.",
    expected_kpi: "overall_health_score",
    expected_window_days: 30,
    confidence: 0.67,
  },
  {
    id: "REC005",
    meeting_id: "MT004",
    agency_id: "AG004",
    text: "Escalate top 20 high-cost claim files to central claims support for joint review.",
    source: "ai_generated",
    rationale: "Claims ratio and renewal risk are both critical, requiring coordinated remediation.",
    expected_kpi: "claims_ratio",
    expected_window_days: 7,
    confidence: 0.81,
  },
  {
    id: "REC006",
    meeting_id: "MT004",
    agency_id: "AG004",
    text: "Launch retention offers for profitable customers in the motor branch before renewal dates.",
    source: "peer_enriched",
    rationale: "Motor growth weakness can be offset by retention-first targeted offers.",
    expected_kpi: "renewal_rate",
    expected_window_days: 30,
    confidence: 0.71,
  },
  {
    id: "REC007",
    meeting_id: "MT005",
    agency_id: "AG005",
    text: "Create referral incentives for top-performing health advisors to accelerate cross-sell.",
    source: "ai_generated",
    rationale: "Strong base performance can be scaled through referral mechanics.",
    expected_kpi: "yoy_growth_health",
    expected_window_days: 30,
    confidence: 0.86,
  },
  {
    id: "REC008",
    meeting_id: "MT006",
    agency_id: "AG006",
    text: "Standardize quarterly business reviews with action owners for each follow-up.",
    source: "manager_override",
    rationale: "Execution inconsistency is causing uneven KPI movement.",
    expected_kpi: "overall_health_score",
    expected_window_days: 30,
    confidence: 0.69,
  },
  {
    id: "REC009",
    meeting_id: "MT007",
    agency_id: "AG007",
    text: "Add a renewal-at-risk dashboard segment and weekly escalation checkpoint.",
    source: "ai_generated",
    rationale: "Renewal trend is soft and requires operational visibility to correct quickly.",
    expected_kpi: "renewal_rate",
    expected_window_days: 30,
    confidence: 0.78,
  },
  {
    id: "REC010",
    meeting_id: "MT008",
    agency_id: "AG008",
    text: "Replicate high-performing health sales scripts across underperforming product lines.",
    source: "peer_enriched",
    rationale: "Existing sales behavior can be reused to improve lagging branches.",
    expected_kpi: "yoy_growth_home",
    expected_window_days: 30,
    confidence: 0.76,
  },
];

export const mockRecommendationDecisions: RecommendationDecisionRecord[] = [
  {
    id: "DEC001",
    recommendation_id: "REC001",
    meeting_id: "MT001",
    agency_id: "AG001",
    decision: "accepted",
    reason: "The agency team agreed to allocate call-center capacity this month.",
    decided_by: "salesperson",
    decided_at: "2026-03-03T10:20:00Z",
  },
  {
    id: "DEC002",
    recommendation_id: "REC002",
    meeting_id: "MT001",
    agency_id: "AG001",
    decision: "modified",
    reason: "Checklist scope narrowed to commercial auto first.",
    edited_text: "Pilot claims pre-check checklist for commercial auto policies only.",
    decided_by: "salesperson",
    decided_at: "2026-03-03T10:28:00Z",
  },
  {
    id: "DEC003",
    recommendation_id: "REC003",
    meeting_id: "MT002",
    agency_id: "AG002",
    decision: "accepted",
    reason: "Team already has active campaign slots for bundled outreach.",
    decided_by: "salesperson",
    decided_at: "2026-03-04T14:06:00Z",
  },
  {
    id: "DEC004",
    recommendation_id: "REC004",
    meeting_id: "MT003",
    agency_id: "AG003",
    decision: "proposed",
    reason: "Awaiting branch manager confirmation for recurring review cadence.",
    decided_by: "salesperson",
    decided_at: "2026-03-05T11:47:00Z",
  },
  {
    id: "DEC005",
    recommendation_id: "REC005",
    meeting_id: "MT004",
    agency_id: "AG004",
    decision: "accepted",
    reason: "Claims owner and underwriter confirmed file list review.",
    decided_by: "salesperson",
    decided_at: "2026-03-06T09:50:00Z",
  },
  {
    id: "DEC006",
    recommendation_id: "REC006",
    meeting_id: "MT004",
    agency_id: "AG004",
    decision: "rejected",
    reason: "Current discount budget cannot support retention offers this quarter.",
    decided_by: "salesperson",
    decided_at: "2026-03-06T10:03:00Z",
  },
  {
    id: "DEC007",
    recommendation_id: "REC007",
    meeting_id: "MT005",
    agency_id: "AG005",
    decision: "accepted",
    reason: "High-performing advisors volunteered to test the referral model.",
    decided_by: "salesperson",
    decided_at: "2026-03-10T13:21:00Z",
  },
  {
    id: "DEC008",
    recommendation_id: "REC008",
    meeting_id: "MT006",
    agency_id: "AG006",
    decision: "modified",
    reason: "Quarterly review cadence changed to bi-monthly due to staff turnover.",
    edited_text: "Run bi-monthly business reviews with named action owners.",
    decided_by: "salesperson",
    decided_at: "2026-03-12T15:16:00Z",
  },
  {
    id: "DEC009",
    recommendation_id: "REC009",
    meeting_id: "MT007",
    agency_id: "AG007",
    decision: "accepted",
    reason: "Weekly escalation checkpoint approved by operations lead.",
    decided_by: "salesperson",
    decided_at: "2026-03-13T10:40:00Z",
  },
  {
    id: "DEC010",
    recommendation_id: "REC010",
    meeting_id: "MT008",
    agency_id: "AG008",
    decision: "accepted",
    reason: "Sales manager requested rollout to two product teams first.",
    decided_by: "salesperson",
    decided_at: "2026-03-14T16:05:00Z",
  },
];

export const mockPreMeetingBriefs: PreMeetingBriefRecord[] = [
  {
    id: "BRF001",
    meeting_id: "MT001",
    agency_id: "AG001",
    created_by: "salesperson",
    key_points: [
      "Renewal rate recovery in expiring policies",
      "Claims ratio stabilization actions",
    ],
    recommendation_ids: ["REC001", "REC002"],
    generated_at: "2026-03-03T09:45:00Z",
  },
  {
    id: "BRF002",
    meeting_id: "MT002",
    agency_id: "AG002",
    created_by: "salesperson",
    key_points: ["Cross-sell penetration for single-product customers"],
    recommendation_ids: ["REC003"],
    generated_at: "2026-03-04T13:30:00Z",
  },
  {
    id: "BRF003",
    meeting_id: "MT003",
    agency_id: "AG003",
    created_by: "salesperson",
    key_points: ["Follow-up cadence and branch-level ownership"],
    recommendation_ids: ["REC004"],
    generated_at: "2026-03-05T10:55:00Z",
  },
  {
    id: "BRF004",
    meeting_id: "MT004",
    agency_id: "AG004",
    created_by: "salesperson",
    key_points: ["Urgent claims remediation and retention strategy"],
    recommendation_ids: ["REC005", "REC006"],
    generated_at: "2026-03-06T09:20:00Z",
  },
  {
    id: "BRF005",
    meeting_id: "MT005",
    agency_id: "AG005",
    created_by: "salesperson",
    key_points: ["Scale high-performing health branch playbook"],
    recommendation_ids: ["REC007"],
    generated_at: "2026-03-10T12:50:00Z",
  },
  {
    id: "BRF006",
    meeting_id: "MT006",
    agency_id: "AG006",
    created_by: "salesperson",
    key_points: ["Execution discipline and action tracking"],
    recommendation_ids: ["REC008"],
    generated_at: "2026-03-12T14:45:00Z",
  },
  {
    id: "BRF007",
    meeting_id: "MT007",
    agency_id: "AG007",
    created_by: "salesperson",
    key_points: ["Early warning and escalation for renewal-at-risk accounts"],
    recommendation_ids: ["REC009"],
    generated_at: "2026-03-13T10:05:00Z",
  },
  {
    id: "BRF008",
    meeting_id: "MT008",
    agency_id: "AG008",
    created_by: "salesperson",
    key_points: ["Transfer winning scripts to weaker product lines"],
    recommendation_ids: ["REC010"],
    generated_at: "2026-03-14T15:25:00Z",
  },
];

export const mockPostMeetingReports: PostMeetingReportRecord[] = [
  {
    id: "RPT001",
    meeting_id: "MT001",
    agency_id: "AG001",
    discussion_summary: "Agency accepted renewal call-list and agreed to immediate pilot for claims checklist.",
    commitments: ["Weekly renewal pipeline review", "Commercial auto checklist trial"],
    deviations: ["Checklist narrowed from all lines to commercial auto only"],
    recommendation_consistency: { REC001: "match", REC002: "match" },
    ai_critique: "Good alignment; add owner names for each weekly review item.",
    created_by: "salesperson",
    created_at: "2026-03-03T18:10:00Z",
  },
  {
    id: "RPT002",
    meeting_id: "MT004",
    agency_id: "AG004",
    discussion_summary: "Claims escalation approved; retention offers postponed due to budget limits.",
    commitments: ["Share top 20 claim files in 48 hours"],
    deviations: ["Retention offer recommendation deferred"],
    recommendation_consistency: { REC005: "match", REC006: "mismatch" },
    ai_critique: "Mismatch is explainable but include budget owner and revisit date.",
    created_by: "salesperson",
    created_at: "2026-03-06T18:30:00Z",
  },
  {
    id: "RPT003",
    meeting_id: "MT007",
    agency_id: "AG007",
    discussion_summary: "Team agreed to launch risk dashboard and maintain weekly escalations.",
    commitments: ["Activate dashboard segment by next Monday", "Escalation check every Friday"],
    deviations: [],
    recommendation_consistency: { REC009: "match" },
    ai_critique: "Strong consistency; baseline dashboard owner should be named.",
    created_by: "salesperson",
    created_at: "2026-03-13T17:35:00Z",
  },
];

export const mockRecommendationOutcomes: RecommendationOutcomeRecord[] = [
  {
    id: "OUT001",
    recommendation_id: "REC001",
    meeting_id: "MT001",
    agency_id: "AG001",
    baseline_value: 62,
    t_plus_7_delta: 1.1,
    t_plus_30_delta: 3.4,
    effectiveness: "effective",
    assessed_at: "2026-04-02",
  },
  {
    id: "OUT002",
    recommendation_id: "REC002",
    meeting_id: "MT001",
    agency_id: "AG001",
    baseline_value: 0.72,
    t_plus_7_delta: -0.01,
    t_plus_30_delta: -0.03,
    effectiveness: "effective",
    assessed_at: "2026-04-02",
  },
  {
    id: "OUT003",
    recommendation_id: "REC003",
    meeting_id: "MT002",
    agency_id: "AG002",
    baseline_value: 18.5,
    t_plus_7_delta: 0.4,
    t_plus_30_delta: 1.2,
    effectiveness: "effective",
    assessed_at: "2026-04-03",
  },
  {
    id: "OUT004",
    recommendation_id: "REC004",
    meeting_id: "MT003",
    agency_id: "AG003",
    baseline_value: 65,
    t_plus_7_delta: 0,
    t_plus_30_delta: 0.2,
    effectiveness: "inconclusive",
    assessed_at: "2026-04-04",
  },
  {
    id: "OUT005",
    recommendation_id: "REC005",
    meeting_id: "MT004",
    agency_id: "AG004",
    baseline_value: 0.6,
    t_plus_7_delta: -0.02,
    t_plus_30_delta: -0.03,
    effectiveness: "effective",
    assessed_at: "2026-04-05",
  },
  {
    id: "OUT006",
    recommendation_id: "REC006",
    meeting_id: "MT004",
    agency_id: "AG004",
    baseline_value: 58,
    t_plus_7_delta: -0.3,
    t_plus_30_delta: -0.6,
    effectiveness: "ineffective",
    assessed_at: "2026-04-05",
  },
  {
    id: "OUT007",
    recommendation_id: "REC008",
    meeting_id: "MT006",
    agency_id: "AG006",
    baseline_value: 70,
    t_plus_7_delta: 0.2,
    t_plus_30_delta: 0.9,
    effectiveness: "effective",
    assessed_at: "2026-04-12",
  },
  {
    id: "OUT008",
    recommendation_id: "REC010",
    meeting_id: "MT008",
    agency_id: "AG008",
    baseline_value: 14.2,
    t_plus_7_delta: 0.1,
    t_plus_30_delta: 0.2,
    effectiveness: "inconclusive",
    assessed_at: "2026-04-14",
  },
];

export const mockValidationFlags: ValidationFlagRecord[] = [
  {
    id: "VAL001",
    recommendation_id: "REC004",
    meeting_id: "MT003",
    agency_id: "AG003",
    reason: "execution_failure",
    reviewer_id: "manager",
    notes: "Review cadence was approved but branch owner handoff was delayed.",
    created_at: "2026-04-04T09:25:00Z",
  },
  {
    id: "VAL002",
    recommendation_id: "REC006",
    meeting_id: "MT004",
    agency_id: "AG004",
    reason: "context_mismatch",
    reviewer_id: "manager",
    notes: "Discount recommendation did not account for active budget freeze.",
    created_at: "2026-04-05T10:10:00Z",
  },
  {
    id: "VAL003",
    recommendation_id: "REC010",
    meeting_id: "MT008",
    agency_id: "AG008",
    reason: "data_issue",
    reviewer_id: "manager",
    notes: "Home line baseline data was stale for one branch segment.",
    created_at: "2026-04-14T11:45:00Z",
  },
];
