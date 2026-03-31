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
    agency_name: "Premium Insurance Group",
    address_text: "123 Main Street",
    city: "New York",
    district: "Manhattan",
    latitude: 40.7589,
    longitude: -73.9851,
    sales_owner: "John Smith",
    priority_tier: "A",
    target_visit_frequency: "weekly",
    preferred_visit_time_window: "morning",
    last_visit_date: "2026-02-25",
    next_recommended_visit_date: "2026-03-08",
  },
  {
    agency_id: "AG002",
    agency_name: "SafeGuard Associates",
    address_text: "456 Oak Avenue",
    city: "Brooklyn",
    district: "Downtown",
    latitude: 40.6782,
    longitude: -73.9442,
    sales_owner: "John Smith",
    priority_tier: "A",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "afternoon",
    last_visit_date: "2026-02-10",
    next_recommended_visit_date: "2026-03-05",
  },
  {
    agency_id: "AG003",
    agency_name: "Metro Coverage Partners",
    address_text: "789 Park Plaza",
    city: "Queens",
    district: "Flushing",
    latitude: 40.7615,
    longitude: -73.8302,
    sales_owner: "John Smith",
    priority_tier: "B",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "any",
    last_visit_date: "2026-01-28",
    next_recommended_visit_date: "2026-03-01",
  },
  {
    agency_id: "AG004",
    agency_name: "Shield Insurance Solutions",
    address_text: "321 Broadway",
    city: "New York",
    district: "Financial District",
    latitude: 40.7069,
    longitude: -74.0113,
    sales_owner: "John Smith",
    priority_tier: "A",
    target_visit_frequency: "weekly",
    preferred_visit_time_window: "morning",
    last_visit_date: "2026-02-20",
    next_recommended_visit_date: "2026-03-04",
  },
  {
    agency_id: "AG005",
    agency_name: "Liberty Protection Agency",
    address_text: "654 Fifth Avenue",
    city: "New York",
    district: "Midtown",
    latitude: 40.7549,
    longitude: -73.9840,
    sales_owner: "John Smith",
    priority_tier: "B",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "afternoon",
    last_visit_date: "2026-02-05",
    next_recommended_visit_date: "2026-03-10",
  },
  {
    agency_id: "AG006",
    agency_name: "Reliable Coverage Inc",
    address_text: "987 Atlantic Avenue",
    city: "Brooklyn",
    district: "Bedford",
    latitude: 40.6851,
    longitude: -73.9537,
    sales_owner: "John Smith",
    priority_tier: "C",
    target_visit_frequency: "quarterly",
    preferred_visit_time_window: "any",
    last_visit_date: "2025-12-15",
    next_recommended_visit_date: "2026-03-15",
  },
  {
    agency_id: "AG007",
    agency_name: "Guardian Insurance Partners",
    address_text: "147 Roosevelt Avenue",
    city: "Queens",
    district: "Jackson Heights",
    latitude: 40.7489,
    longitude: -73.8917,
    sales_owner: "John Smith",
    priority_tier: "B",
    target_visit_frequency: "monthly",
    preferred_visit_time_window: "morning",
    last_visit_date: "2026-02-12",
    next_recommended_visit_date: "2026-03-12",
  },
  {
    agency_id: "AG008",
    agency_name: "Secure Future Agency",
    address_text: "258 Wall Street",
    city: "New York",
    district: "Financial District",
    latitude: 40.7074,
    longitude: -74.0089,
    sales_owner: "John Smith",
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
  benchmark_key: "John Smith",
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
    description: "Discuss renewal rate drop with Premium Insurance Group",
    due_date: "2026-03-05",
    status: "pending",
    priority: "high",
  },
  {
    id: "T002",
    agency_id: "AG004",
    title: "Review claims spike",
    description: "Investigate high claims ratio at Shield Insurance",
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
