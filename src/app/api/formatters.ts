import type { DailyVisitPlan, MeetingNarrative, PortfolioSummaryResponse } from "./types";

interface NarrativeFormatOptions {
  sectionTitle: string;
  includeBenchmarks: boolean;
  maxTalkTrackItems: number;
  maxQuestions: number;
}

export function formatMeetingNarrativeText(
  narrative: MeetingNarrative,
  options: NarrativeFormatOptions,
): string {
  const lines: string[] = [];

  lines.push(options.sectionTitle);
  lines.push("=".repeat(80));
  lines.push("");
  lines.push("OPENING:");
  lines.push(narrative.opening_context);
  lines.push("");
  lines.push("TALK TRACK:");
  narrative.talk_track.slice(0, options.maxTalkTrackItems).forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`);
  });
  lines.push("");
  lines.push("AGENDA:");
  narrative.agenda.forEach((item) => {
    lines.push(`${item.order}. ${item.topic} (${item.duration_minutes} min) - ${item.objective}`);
  });
  lines.push("");
  lines.push("KEY QUESTIONS:");
  narrative.questions_to_ask.slice(0, options.maxQuestions).forEach((item, index) => {
    lines.push(`${index + 1}. ${item}`);
  });
  lines.push("");

  if (narrative.risks.length > 0) {
    lines.push("RISKS:");
    narrative.risks.forEach((risk) => {
      lines.push(`- ${risk.title} [${risk.severity}] - ${risk.explanation}`);
    });
    lines.push("");
  }

  if (narrative.opportunities.length > 0) {
    lines.push("OPPORTUNITIES:");
    narrative.opportunities.forEach((item) => {
      lines.push(`- ${item.title} (${item.branch}) - ${item.rationale}`);
    });
    lines.push("");
  }

  if (options.includeBenchmarks && narrative.metric_quotes.length > 0) {
    lines.push("METRIC QUOTES:");
    narrative.metric_quotes.forEach((quote) => {
      lines.push(`- ${quote.quote_text}`);
    });
    lines.push("");
  }

  lines.push("COMMITMENTS:");
  narrative.commitments_next_steps.forEach((item) => {
    lines.push(`- ${item}`);
  });

  if (narrative.missing_data_notes.length > 0) {
    lines.push("");
    lines.push("MISSING DATA NOTES:");
    narrative.missing_data_notes.forEach((item) => {
      lines.push(`- ${item}`);
    });
  }

  return lines.join("\n");
}

export function formatDailyPlanAssistantText(plan: DailyVisitPlan): string {
  const lines: string[] = [];
  lines.push(`Daily Plan for ${plan.plan_date}`);
  lines.push("");
  lines.push("Visit Sequence:");
  plan.visits.forEach((visit) => {
    lines.push(
      `${visit.order}. ${visit.time_window} - ${visit.agency_name} (${visit.goal}), ${visit.city}`,
    );
  });
  lines.push("");
  lines.push(
    `Route estimate: ${plan.summary.total_distance_km.toFixed(1)} km, ${plan.summary.total_travel_minutes} minutes.`,
  );
  if (plan.summary.optimization_notes.length > 0) {
    lines.push("Notes:");
    plan.summary.optimization_notes.forEach((note) => lines.push(`- ${note}`));
  }
  return lines.join("\n");
}

export function formatPortfolioSummaryAssistantText(
  summary: PortfolioSummaryResponse,
  riskAgencyNames: string[],
): string {
  const lines: string[] = [];
  lines.push("Portfolio Snapshot:");
  lines.push(`- Agencies: ${summary.agency_count}`);
  lines.push(`- Total revenue: ${Math.round(summary.total_revenue).toLocaleString()}`);
  lines.push(`- Avg renewal rate: ${summary.avg_renewal_rate.toFixed(1)}%`);
  lines.push(`- Avg claims ratio: ${(summary.avg_claims_ratio * 100).toFixed(1)}%`);
  lines.push(`- Renewal risk agencies: ${summary.renewal_risk_agencies}`);
  if (riskAgencyNames.length > 0) {
    lines.push(`- Highest priority risks: ${riskAgencyNames.join(", ")}`);
  }
  return lines.join("\n");
}
