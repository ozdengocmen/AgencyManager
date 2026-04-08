import { useState } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
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
  const { id } = useParams<{ id: string }>();
  const agency = mockAgencies.find(a => a.agency_id === id);
  const kpis = agency ? mockKPIs[agency.agency_id] : null;
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [narrative, setNarrative] = useState("");

  if (!agency || !kpis) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Agency not found</h2>
          <Link to="/app/agencies">
            <Button className="mt-4">Back to Agencies</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Prepare branch growth data
  const branchData = [
    { name: "Motor", growth: kpis.yoy_growth_motor, benchmark: mockBenchmarks.avg_yoy_growth_motor },
    { name: "Home", growth: kpis.yoy_growth_home, benchmark: mockBenchmarks.avg_yoy_growth_home },
    { name: "Health", growth: kpis.yoy_growth_health, benchmark: mockBenchmarks.avg_yoy_growth_health },
  ];

  const generateNarrative = () => {
    const text = `MEETING PREPARATION - ${agency.agency_name}

OPENING CONTEXT:
Thank you for making time today. I wanted to review our partnership performance and discuss how we can strengthen our collaboration going forward.

PERFORMANCE RECAP:
• Overall Health Score: ${kpis.overall_health_score}/100 (Portfolio avg: ${mockBenchmarks.avg_overall_health_score.toFixed(0)})
• Renewal Rate: ${kpis.renewal_rate}% vs portfolio average of ${mockBenchmarks.avg_renewal_rate}%
  ${kpis.renewal_rate < mockBenchmarks.avg_renewal_rate ? "⚠️ Below benchmark by " + (mockBenchmarks.avg_renewal_rate - kpis.renewal_rate).toFixed(1) + " points" : "✓ Above benchmark"}
• Claims Ratio: ${(kpis.claims_ratio * 100).toFixed(0)}% vs portfolio average of ${(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
  ${kpis.claims_ratio > mockBenchmarks.avg_claims_ratio ? "⚠️ Higher than benchmark" : "✓ Better than benchmark"}
• Total Premiums: $${(kpis.premiums_written_total / 1000000).toFixed(2)}M
• Portfolio Concentration: ${(kpis.portfolio_concentration * 100).toFixed(0)}%

RISKS TO ADDRESS:
${kpis.renewal_risk_flag ? "• ⚠️ RENEWAL RISK FLAG - Priority attention needed on customer retention\n" : ""}${kpis.claims_ratio > mockBenchmarks.avg_claims_ratio ? "• Claims ratio above portfolio average - review claims management processes\n" : ""}${kpis.portfolio_concentration > 0.4 ? "• High portfolio concentration (>40%) - diversification opportunity\n" : ""}

OPPORTUNITIES:
• Best performing branch: ${kpis.growth_best_branch.toUpperCase()} (+${kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]}% YoY)
${kpis.overall_health_score > 80 ? "• Strong overall health score - leverage for expansion\n" : ""}• Cross-sell potential between motor, home, and health products

QUESTIONS TO ASK:
1. What factors are driving your ${kpis.growth_best_branch} branch success? Can we replicate this in other areas?
2. ${kpis.renewal_risk_flag ? "I've noticed renewal rates trending down. What challenges are you facing with customer retention?" : "How can we support your excellent renewal performance?"}
3. Are there specific customer segments where you see the most growth potential?
4. What support or resources from us would make the biggest difference for your business?
5. How are you managing claims communication with customers?

PROPOSED COMMITMENTS:
• Schedule monthly performance reviews
• Provide enhanced training on ${kpis.growth_worst_branch} products
• Explore co-marketing opportunities for high-performing segments
• Set quarterly growth targets together
• Establish direct escalation channel for claims support

NEXT STEPS:
□ Review detailed claims data together
□ Schedule product training session
□ Create joint growth plan for next quarter
□ Follow up on specific customer concerns raised
□ Book next meeting before leaving`;

    setNarrative(text);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <Link to="/app/agencies" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Agencies
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">{agency.agency_name}</h1>
              <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'}>
                Tier {agency.priority_tier}
              </Badge>
              {kpis.renewal_risk_flag && (
                <Badge variant="destructive">Renewal Risk</Badge>
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
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Add to Plan
            </Button>
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Prep
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-white px-8">
          <TabsList className="bg-transparent border-0 h-auto p-0">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="diagnostics"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Diagnostics
            </TabsTrigger>
            <TabsTrigger 
              value="meeting-prep"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Meeting Prep
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none"
            >
              Notes & Tasks
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-8">
            <TabsContent value="overview" className="m-0 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Premiums Written</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      ${(kpis.premiums_written_total / 1000000).toFixed(1)}M
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      ${(kpis.total_revenue / 1000000).toFixed(1)}M
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Renewal Rate</p>
                    <p className={`text-2xl font-bold mt-1 ${kpis.renewal_rate >= mockBenchmarks.avg_renewal_rate ? 'text-green-600' : 'text-red-600'}`}>
                      {kpis.renewal_rate}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Avg: {mockBenchmarks.avg_renewal_rate}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Claims Ratio</p>
                    <p className={`text-2xl font-bold mt-1 ${kpis.claims_ratio <= mockBenchmarks.avg_claims_ratio ? 'text-green-600' : 'text-red-600'}`}>
                      {(kpis.claims_ratio * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Avg: {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Concentration</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {(kpis.portfolio_concentration * 100).toFixed(0)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-600">Health Score</p>
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
                  <CardTitle>Benchmark Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Renewal Rate</span>
                        <span className="font-medium">
                          {kpis.renewal_rate}% vs {mockBenchmarks.avg_renewal_rate}%
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
                        <span>Claims Ratio</span>
                        <span className="font-medium">
                          {(kpis.claims_ratio * 100).toFixed(0)}% vs {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
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
                        <span>Health Score</span>
                        <span className="font-medium">
                          {kpis.overall_health_score} vs {mockBenchmarks.avg_overall_health_score.toFixed(0)}
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
                    Why This Agency Matters Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {kpis.renewal_risk_flag && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Renewal Risk Alert:</strong> Renewal rate at {kpis.renewal_rate}% is {(mockBenchmarks.avg_renewal_rate - kpis.renewal_rate).toFixed(1)} points below portfolio average. Immediate attention recommended.
                        </span>
                      </li>
                    )}
                    {kpis.claims_ratio > mockBenchmarks.avg_claims_ratio && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Claims Ratio Elevated:</strong> At {(kpis.claims_ratio * 100).toFixed(0)}%, claims are {((kpis.claims_ratio - mockBenchmarks.avg_claims_ratio) * 100).toFixed(0)} points above benchmark.
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Growth Opportunity:</strong> {kpis.growth_best_branch.charAt(0).toUpperCase() + kpis.growth_best_branch.slice(1)} branch showing strong growth at +{kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]}% YoY.
                      </span>
                    </li>
                    {kpis.portfolio_concentration > 0.4 && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Concentration Risk:</strong> Portfolio concentration at {(kpis.portfolio_concentration * 100).toFixed(0)}% suggests diversification opportunity.
                        </span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              {/* Visit Planning */}
              <Card>
                <CardHeader>
                  <CardTitle>Visit Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Last Visit</p>
                      <p className="font-medium">{new Date(agency.last_visit_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Next Recommended Visit</p>
                      <p className="font-medium">{new Date(agency.next_recommended_visit_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Target Frequency</p>
                      <p className="font-medium capitalize">{agency.target_visit_frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Preferred Time</p>
                      <p className="font-medium capitalize">{agency.preferred_visit_time_window}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostics" className="m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Branch YoY Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={branchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="growth" name="Growth %" radius={[8, 8, 0, 0]}>
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
                    AI Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Key Drivers</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Renewal rate: {kpis.renewal_rate}% (vs {mockBenchmarks.avg_renewal_rate}% benchmark)</li>
                      <li>• Claims ratio: {(kpis.claims_ratio * 100).toFixed(0)}% (vs {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}% benchmark)</li>
                      <li>• Portfolio concentration: {(kpis.portfolio_concentration * 100).toFixed(0)}%</li>
                      <li>• Best performing branch: {kpis.growth_best_branch} (+{kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]}%)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Risks</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      {kpis.renewal_risk_flag && <li>• Renewal risk flag active - customer retention needs focus</li>}
                      {kpis.claims_ratio > mockBenchmarks.avg_claims_ratio && <li>• Claims ratio above benchmark - review underwriting quality</li>}
                      {kpis.portfolio_concentration > 0.4 && <li>• High concentration risk - consider diversification strategy</li>}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Opportunities</h4>
                    <ul className="space-y-1 text-sm text-slate-700">
                      <li>• Leverage {kpis.growth_best_branch} branch success for cross-sell opportunities</li>
                      {kpis.growth_worst_branch !== kpis.growth_best_branch && (
                        <li>• Improve {kpis.growth_worst_branch} branch performance through targeted training</li>
                      )}
                      <li>• Total premiums at ${(kpis.premiums_written_total / 1000000).toFixed(1)}M - potential for expansion</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meeting-prep" className="m-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Narrative Builder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button onClick={generateNarrative}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Narrative
                    </Button>
                    <Button variant="outline">Generate 3 Talk Tracks</Button>
                    <Button variant="outline">Generate Agenda (30-min)</Button>
                  </div>

                  <Textarea
                    placeholder="Generated narrative will appear here..."
                    value={narrative}
                    onChange={(e) => setNarrative(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                  />

                  {narrative && (
                    <div className="flex gap-2">
                      <Button>Save to Notes</Button>
                      <Button variant="outline">Create Tasks from Output</Button>
                      <Button variant="outline">Export as PDF</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="m-0 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Notes and tasks functionality will be available here. You can log meeting notes, 
                    track follow-ups, and create action items from AI-generated content.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
