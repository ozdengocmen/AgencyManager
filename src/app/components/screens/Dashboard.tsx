import { Link, useLocation, useNavigate } from "react-router";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar, 
  MapPin,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { mockAgencies, mockKPIs, mockBenchmarks } from "../../data/mockData";
import { useAppState } from "../../state";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { getOpenInAssistantLabel, openInAssistant } from "../ai/assistantUtils";

function getVisitStartTime(timeWindow: string): string {
  const [start] = timeWindow.split("-");
  return (start || timeWindow).trim();
}

function formatMinutesAsDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return "0m";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { session, settings, planner },
    addAgencyToPlan,
  } = useAppState();
  const { copy } = useI18n();
  const openAssistantLabel = getOpenInAssistantLabel(settings.language);

  // Calculate portfolio totals
  const totalPremiums = Object.values(mockKPIs).reduce((sum, kpi) => sum + kpi.premiums_written_total, 0);
  const totalRevenue = Object.values(mockKPIs).reduce((sum, kpi) => sum + kpi.total_revenue, 0);
  const avgClaimsRatio = Object.values(mockKPIs).reduce((sum, kpi) => sum + kpi.claims_ratio, 0) / Object.keys(mockKPIs).length;
  const avgRenewalRate = Object.values(mockKPIs).reduce((sum, kpi) => sum + kpi.renewal_rate, 0) / Object.keys(mockKPIs).length;
  const avgHealthScore = Object.values(mockKPIs).reduce((sum, kpi) => sum + kpi.overall_health_score, 0) / Object.keys(mockKPIs).length;

  // Get priority agencies (AI-ranked)
  const priorityAgencies = mockAgencies
    .map(agency => ({
      ...agency,
      kpis: mockKPIs[agency.agency_id]
    }))
    .sort((a, b) => {
      // Simple priority scoring: renewal risk + tier + claims ratio
      const scoreA = (a.kpis.renewal_risk_flag ? 10 : 0) + (a.priority_tier === 'A' ? 5 : a.priority_tier === 'B' ? 3 : 1) + (a.kpis.claims_ratio > mockBenchmarks.avg_claims_ratio ? 3 : 0);
      const scoreB = (b.kpis.renewal_risk_flag ? 10 : 0) + (b.priority_tier === 'A' ? 5 : b.priority_tier === 'B' ? 3 : 1) + (b.kpis.claims_ratio > mockBenchmarks.avg_claims_ratio ? 3 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 8);

  const agenciesById = useMemo(
    () => new Map(mockAgencies.map((agency) => [agency.agency_id, agency])),
    [],
  );
  const orderedPlannerVisits = useMemo(
    () => [...planner.visits].sort((left, right) => left.order - right.order),
    [planner.visits],
  );

  const firstVisit = orderedPlannerVisits[0];
  const nextVisit = orderedPlannerVisits[1];

  const firstAgency = firstVisit ? agenciesById.get(firstVisit.agency_id) : null;
  const nextAgency = nextVisit ? agenciesById.get(nextVisit.agency_id) : null;
  const nextAgencyKpis = nextAgency ? mockKPIs[nextAgency.agency_id] : null;
  const nextVisitDate = nextAgency?.next_recommended_visit_date
    ? new Date(nextAgency.next_recommended_visit_date).toLocaleDateString(copy.locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : copy.dashboard.notScheduled;

  const todaysVisits = orderedPlannerVisits.length;
  const estimatedTravelMinutes = Math.max(0, (todaysVisits - 1) * 35);
  const estimatedTravelTime = formatMinutesAsDuration(estimatedTravelMinutes);

  const handleAddToPlan = (agencyId: string) => {
    const added = addAgencyToPlan(agencyId);
    if (!added) {
      toast.message(copy.dashboard.agencyAlreadyInPlan);
      return;
    }
    toast.success(copy.dashboard.addedAgencyToPlan(agencyId));
  };

  const handleOpenInAssistant = (agencyId: string, agencyName: string) => {
    const prompt =
      settings.language === "tr"
        ? `${agencyName} (${agencyId}) icin acente gorusmesi ozeti, riskler ve onerilen aksiyonlari olustur.`
        : `Create a concise agency visit brief for ${agencyName} (${agencyId}) with risks and actions.`;
    openInAssistant(navigate, location, prompt);
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="min-w-[980px] p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{copy.dashboard.title}</h1>
            <p className="text-slate-600 mt-1">
              {copy.dashboard.welcome(session.user?.name || copy.dashboard.userFallback)}
            </p>
          </div>

          {/* Today's Plan Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {copy.dashboard.todaysPlan}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">{copy.dashboard.visitsPlanned}</p>
                    <p className="text-2xl font-bold text-slate-900">{todaysVisits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{copy.dashboard.estimatedTravelTime}</p>
                    <p className="text-2xl font-bold text-slate-900">{estimatedTravelTime}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-600 mb-1">{copy.dashboard.firstVisit}</p>
                  <p className="font-medium">
                    {firstAgency?.agency_name || copy.dashboard.noVisitsPlanned}
                  </p>
                  <p className="text-sm text-slate-500">
                    {firstAgency && firstVisit
                      ? `${firstAgency.city}, ${firstAgency.district} · ${getVisitStartTime(firstVisit.time_window)}`
                      : copy.dashboard.addVisitsInDailyPlan}
                  </p>
                </div>
                <Link to="/app/daily-plan">
                  <Button className="w-full">
                    {copy.dashboard.viewDayPlan}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {copy.dashboard.nextVisit}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {nextAgency?.agency_name || copy.dashboard.notScheduled}
                  </p>
                  <p className="text-sm text-slate-600">
                    {nextAgency
                      ? `${nextAgency.city} · ${copy.dashboard.priorityTier(nextAgency.priority_tier)}`
                      : copy.dashboard.noNextVisit}
                  </p>
                  {nextAgency && nextAgencyKpis && (
                    <div className="flex gap-2 mt-2">
                      {nextAgencyKpis.renewal_risk_flag && (
                        <Badge variant="destructive" className="text-xs">
                          {copy.dashboard.renewalRisk}
                        </Badge>
                      )}
                      {nextAgencyKpis.claims_ratio > mockBenchmarks.avg_claims_ratio && (
                        <Badge variant="secondary" className="text-xs">
                          {copy.dashboard.highClaims}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-600">{copy.dashboard.nextRecommendedVisit}</p>
                  <p className="font-medium">{nextVisitDate}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    nextAgency && handleOpenInAssistant(nextAgency.agency_id, nextAgency.agency_name)
                  }
                  disabled={!nextAgency}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {openAssistantLabel}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio KPIs */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{copy.dashboard.portfolioKpis}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">{copy.dashboard.totalPremiums}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${(totalPremiums / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +8.2% YoY
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">{copy.dashboard.totalRevenue}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ${(totalRevenue / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12.5% YoY
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">{copy.dashboard.avgClaimsRatio}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(avgClaimsRatio * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {copy.dashboard.benchmark}: {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">{copy.dashboard.avgRenewalRate}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {avgRenewalRate.toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {copy.dashboard.benchmark}: {mockBenchmarks.avg_renewal_rate}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">{copy.dashboard.avgHealthScore}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {avgHealthScore.toFixed(0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {copy.dashboard.aboveTarget}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Priority Feed (AI-Ranked) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">{copy.dashboard.priorityFeed}</h2>
              <Link to="/app/agencies">
                <Button variant="outline" size="sm">{copy.dashboard.viewAllAgencies}</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {priorityAgencies.map((agency) => {
                const kpis = agency.kpis;
                const badges = [];
                
                if (kpis.renewal_risk_flag) badges.push({ label: copy.dashboard.renewalRisk, variant: "destructive" as const });
                if (kpis.claims_ratio > mockBenchmarks.avg_claims_ratio) badges.push({ label: copy.dashboard.highClaims, variant: "secondary" as const });
                if (kpis.portfolio_concentration > 0.4) badges.push({ label: copy.dashboard.concentrationRisk, variant: "secondary" as const });
                if (kpis.overall_health_score > 85) badges.push({ label: copy.dashboard.growthBadge(kpis.growth_best_branch, kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis] as number), variant: "default" as const });

                return (
                  <Card key={agency.agency_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{agency.agency_name}</h3>
                            <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'} className="text-xs">
                              {agency.priority_tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{agency.city} · {agency.district}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {badges.map((badge, idx) => (
                          <Badge key={idx} variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4 pt-3 border-t">
                        <div>
                          <p className="text-xs text-slate-600">{copy.dashboard.healthScore}</p>
                          <p className="text-sm font-semibold">{kpis.overall_health_score}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">{copy.dashboard.renewalRate}</p>
                          <p className="text-sm font-semibold">{kpis.renewal_rate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">{copy.dashboard.claimsRatio}</p>
                          <p className="text-sm font-semibold">{(kpis.claims_ratio * 100).toFixed(0)}%</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={`/app/agencies/${agency.agency_id}`}>{copy.dashboard.open}</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAddToPlan(agency.agency_id)}
                        >
                          {copy.dashboard.addToPlan}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenInAssistant(agency.agency_id, agency.agency_name)}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          {openAssistantLabel}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
      </div>
    </div>
  );
}
