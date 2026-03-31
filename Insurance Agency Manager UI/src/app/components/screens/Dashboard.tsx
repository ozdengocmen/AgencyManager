import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
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

export function Dashboard() {
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

  const todaysVisits = 3;
  const estimatedTravelTime = "2h 45m";

  return (
    <div className="flex-1 overflow-auto">
      <ScrollArea className="h-full">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, John. Here's your portfolio overview.</p>
          </div>

          {/* Today's Plan Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Visits Planned</p>
                    <p className="text-2xl font-bold text-slate-900">{todaysVisits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Est. Travel Time</p>
                    <p className="text-2xl font-bold text-slate-900">{estimatedTravelTime}</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-600 mb-1">First Visit</p>
                  <p className="font-medium">Shield Insurance Solutions</p>
                  <p className="text-sm text-slate-500">Financial District, 9:00 AM</p>
                </div>
                <Link to="/app/daily-plan">
                  <Button className="w-full">
                    View Day Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Next Visit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Premium Insurance Group</p>
                  <p className="text-sm text-slate-600">Manhattan · Priority A</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">Renewal Risk</Badge>
                    <Badge variant="secondary" className="text-xs">High Claims</Badge>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-slate-600">Next Recommended Visit</p>
                  <p className="font-medium">March 8, 2026</p>
                </div>
                <Link to="/app/meeting-prep">
                  <Button variant="outline" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Meeting Prep
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio KPIs */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Portfolio KPIs</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Total Premiums</p>
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
                  <p className="text-sm text-slate-600">Total Revenue</p>
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
                  <p className="text-sm text-slate-600">Avg Claims Ratio</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {(avgClaimsRatio * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Benchmark: {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Avg Renewal Rate</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {avgRenewalRate.toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Benchmark: {mockBenchmarks.avg_renewal_rate}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-600">Avg Health Score</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {avgHealthScore.toFixed(0)}
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Above target
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Priority Feed (AI-Ranked) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Priority Feed (AI-Ranked)</h2>
              <Link to="/app/agencies">
                <Button variant="outline" size="sm">View All Agencies</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {priorityAgencies.map((agency) => {
                const kpis = agency.kpis;
                const badges = [];
                
                if (kpis.renewal_risk_flag) badges.push({ label: "Renewal Risk", variant: "destructive" as const });
                if (kpis.claims_ratio > mockBenchmarks.avg_claims_ratio) badges.push({ label: "High Claims", variant: "secondary" as const });
                if (kpis.portfolio_concentration > 0.4) badges.push({ label: "Concentration Risk", variant: "secondary" as const });
                if (kpis.overall_health_score > 85) badges.push({ label: `Growth: ${kpis.growth_best_branch}`, variant: "default" as const });

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
                          <p className="text-xs text-slate-600">Health Score</p>
                          <p className="text-sm font-semibold">{kpis.overall_health_score}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Renewal Rate</p>
                          <p className="text-sm font-semibold">{kpis.renewal_rate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Claims Ratio</p>
                          <p className="text-sm font-semibold">{(kpis.claims_ratio * 100).toFixed(0)}%</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link to={`/app/agencies/${agency.agency_id}`}>Open</Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Add to Plan
                        </Button>
                        <Button variant="outline" size="sm">
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
