import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
} from "lucide-react";
import { mockAgencies, mockKPIs, mockBenchmarks } from "../../data/mockData";
import { useI18n } from "../../i18n";
import { useAppState } from "../../state";
import { toast } from "sonner";
import { getOpenInAssistantLabel, openInAssistant } from "../ai/assistantUtils";
import { AgencyMeetingFlowCard } from "./meeting/AgencyMeetingFlowCard";
import { AgencyNotesTasksPanel } from "./meeting/AgencyNotesTasksPanel";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export function AgencyProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { addAgencyToPlan, state } = useAppState();
  const { copy: i18nCopy } = useI18n();
  const copy = i18nCopy.agencyProfile;
  const openAssistantLabel = getOpenInAssistantLabel(state.settings.language);
  const tabFromQuery = useMemo(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    return tab === "overview" || tab === "diagnostics" || tab === "meeting-prep" || tab === "notes"
      ? tab
      : "overview";
  }, [location.search]);
  const agency = mockAgencies.find(a => a.agency_id === id);
  const kpis = agency ? mockKPIs[agency.agency_id] : null;
  const [activeTab, setActiveTab] = useState(tabFromQuery);

  useEffect(() => {
    setActiveTab(tabFromQuery);
  }, [tabFromQuery]);

  if (!agency || !kpis) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">{copy.notFoundTitle}</h2>
          <Link to="/app/agencies">
            <Button className="mt-4">{copy.backToAgencies}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare branch growth data
  const branchData = [
    {
      name: copy.branchLabel("motor"),
      growth: kpis.yoy_growth_motor,
      benchmark: mockBenchmarks.avg_yoy_growth_motor,
    },
    {
      name: copy.branchLabel("home"),
      growth: kpis.yoy_growth_home,
      benchmark: mockBenchmarks.avg_yoy_growth_home,
    },
    {
      name: copy.branchLabel("health"),
      growth: kpis.yoy_growth_health,
      benchmark: mockBenchmarks.avg_yoy_growth_health,
    },
  ];

  const handleOpenAssistant = () => {
    const prompt =
      state.settings.language === "tr"
        ? `${agency.agency_name} (${agency.agency_id}) icin performans ozeti, riskler ve toplanti aksiyonlari hazirla.`
        : `Prepare performance summary, risks, and meeting actions for ${agency.agency_name} (${agency.agency_id}).`;
    openInAssistant(navigate, location, prompt);
  };

  const handleAddToPlan = () => {
    const added = addAgencyToPlan(agency.agency_id);
    if (!added) {
      toast.message(copy.agencyAlreadyInPlan);
      return;
    }
    toast.success(copy.addedAgencyToPlan(agency.agency_id));
  };

  const handleTabChange = (nextTab: string) => {
    setActiveTab(nextTab);
    const params = new URLSearchParams(location.search);
    if (nextTab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : "",
      },
      { replace: true },
    );
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <Link to="/app/agencies" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {copy.backToAgencies}
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{agency.agency_name}</h1>
              <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'}>
                {copy.tierLabel(agency.priority_tier)}
              </Badge>
              {kpis.renewal_risk_flag && (
                <Badge variant="destructive">{copy.renewalRisk}</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {agency.address_text}, {agency.city}, {agency.district}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddToPlan}>
              <Calendar className="w-4 h-4 mr-2" />
              {copy.addToPlan}
            </Button>
            <Button
              onClick={handleOpenAssistant}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {openAssistantLabel}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex-1 min-w-0 flex flex-col"
      >
        <div className="border-b bg-white px-8 overflow-x-auto">
          <TabsList className="bg-transparent border-0 h-auto p-0 min-w-max">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              {copy.tabOverview}
            </TabsTrigger>
            <TabsTrigger 
              value="diagnostics"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              {copy.tabDiagnostics}
            </TabsTrigger>
            <TabsTrigger 
              value="meeting-prep"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              {copy.tabMeetingPrep}
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              {copy.tabNotesTasks}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          <div className="min-w-fit p-8">
            <TabsContent value="overview" className="m-0 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">{copy.premiumsWritten}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      ${(kpis.premiums_written_total / 1000000).toFixed(1)}M
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">{copy.totalRevenue}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      ${(kpis.total_revenue / 1000000).toFixed(1)}M
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">{copy.renewalRate}</p>
                    <p className={`text-2xl font-bold mt-1 ${kpis.renewal_rate >= mockBenchmarks.avg_renewal_rate ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.renewal_rate}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {copy.averageLabel(`${mockBenchmarks.avg_renewal_rate}%`)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">{copy.claimsRatio}</p>
                    <p className={`text-2xl font-bold mt-1 ${kpis.claims_ratio <= mockBenchmarks.avg_claims_ratio ? 'text-green-600' : 'text-red-600'}`}>
                      {(kpis.claims_ratio * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {copy.averageLabel(`${(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%`)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">{copy.concentration}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {(kpis.portfolio_concentration * 100).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">{copy.healthScore}</p>
                    <p className={`text-2xl font-bold mt-1 ${kpis.overall_health_score >= 80 ? 'text-green-600' : kpis.overall_health_score >= 60 ? 'text-slate-900' : 'text-red-600'}`}>
                      {kpis.overall_health_score}
                    </p>
                    <Progress value={kpis.overall_health_score} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Benchmark Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>{copy.benchmarkComparison}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{copy.renewalRate}</span>
                        <span className="font-medium">
                          {kpis.renewal_rate}% {copy.compareWith} {mockBenchmarks.avg_renewal_rate}%
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Progress value={(kpis.renewal_rate / mockBenchmarks.avg_renewal_rate) * 100} className="flex-1" />
                        {kpis.renewal_rate >= mockBenchmarks.avg_renewal_rate ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{copy.claimsRatio}</span>
                        <span className="font-medium">
                          {(kpis.claims_ratio * 100).toFixed(0)}% {copy.compareWith} {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Progress value={(mockBenchmarks.avg_claims_ratio / kpis.claims_ratio) * 100} className="flex-1" />
                        {kpis.claims_ratio <= mockBenchmarks.avg_claims_ratio ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{copy.healthScore}</span>
                        <span className="font-medium">
                          {kpis.overall_health_score} {copy.compareWith} {mockBenchmarks.avg_overall_health_score.toFixed(0)}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Progress value={(kpis.overall_health_score / mockBenchmarks.avg_overall_health_score) * 100} className="flex-1" />
                        {kpis.overall_health_score >= mockBenchmarks.avg_overall_health_score ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {copy.whyAgencyMattersToday}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {kpis.renewal_risk_flag && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>{copy.renewalRisk}:</strong>{" "}
                          {copy.renewalRiskAlert(
                            kpis.renewal_rate,
                            mockBenchmarks.avg_renewal_rate - kpis.renewal_rate,
                          )}
                        </span>
                      </li>
                    )}
                    {kpis.claims_ratio > mockBenchmarks.avg_claims_ratio && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>{copy.claimsRatio}:</strong>{" "}
                          {copy.claimsRatioElevated(
                            kpis.claims_ratio * 100,
                            (kpis.claims_ratio - mockBenchmarks.avg_claims_ratio) * 100,
                          )}
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>{copy.opportunities}:</strong>{" "}
                        {copy.growthOpportunity(
                          copy.branchLabel(kpis.growth_best_branch),
                          Number(kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]),
                        )}
                      </span>
                    </li>
                    {kpis.portfolio_concentration > 0.4 && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>{copy.concentration}:</strong>{" "}
                          {copy.concentrationRiskText(kpis.portfolio_concentration * 100)}
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Visit Planning */}
              <Card>
                <CardHeader>
                  <CardTitle>{copy.visitPlanning}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">{copy.lastVisit}</p>
                      <p className="font-medium">
                        {new Date(agency.last_visit_date).toLocaleDateString(i18nCopy.locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{copy.nextRecommendedVisit}</p>
                      <p className="font-medium">
                        {new Date(agency.next_recommended_visit_date).toLocaleDateString(i18nCopy.locale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{copy.targetFrequency}</p>
                      <p className="font-medium">{copy.frequencyLabel(agency.target_visit_frequency)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{copy.preferredTime}</p>
                      <p className="font-medium">{copy.timeWindowLabel(agency.preferred_visit_time_window)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostics" className="m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{copy.branchYoyGrowth}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="growth" name={copy.branchGrowthPercent} radius={[8, 8, 0, 0]}>
                        {branchData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.growth >= entry.benchmark ? "#22c55e" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {copy.aiPerformanceAnalysis}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{copy.keyDrivers}</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• {copy.keyDriverRenewal(kpis.renewal_rate, mockBenchmarks.avg_renewal_rate)}</li>
                      <li>
                        •{" "}
                        {copy.keyDriverClaims(
                          kpis.claims_ratio * 100,
                          mockBenchmarks.avg_claims_ratio * 100,
                        )}
                      </li>
                      <li>• {copy.keyDriverConcentration(kpis.portfolio_concentration * 100)}</li>
                      <li>
                        •{" "}
                        {copy.keyDriverBestBranch(
                          copy.branchLabel(kpis.growth_best_branch),
                          Number(kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]),
                        )}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{copy.risks}</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {kpis.renewal_risk_flag && <li>• {copy.riskRenewal}</li>}
                      {kpis.claims_ratio > mockBenchmarks.avg_claims_ratio && <li>• {copy.riskClaims}</li>}
                      {kpis.portfolio_concentration > 0.4 && <li>• {copy.riskConcentration}</li>}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{copy.opportunities}</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• {copy.opportunityLeverage(copy.branchLabel(kpis.growth_best_branch))}</li>
                      {kpis.growth_worst_branch !== kpis.growth_best_branch && (
                        <li>• {copy.opportunityImprove(copy.branchLabel(kpis.growth_worst_branch))}</li>
                      )}
                      <li>• {copy.opportunityPremiums((kpis.premiums_written_total / 1000000).toFixed(1))}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meeting-prep" className="m-0 space-y-4">
              <AgencyMeetingFlowCard agencyId={agency.agency_id} />
            </TabsContent>

            <TabsContent value="notes" className="m-0 space-y-4">
              <AgencyNotesTasksPanel agencyId={agency.agency_id} agencyName={agency.agency_name} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
