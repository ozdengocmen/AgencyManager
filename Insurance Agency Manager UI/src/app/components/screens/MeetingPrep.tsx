import { useState } from "react";
import { useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sparkles, FileText, Download } from "lucide-react";
import { mockAgencies, mockKPIs, mockBenchmarks } from "../../data/mockData";

export function MeetingPrep() {
  const [searchParams] = useSearchParams();
  const initialAgencyId = searchParams.get("agencyId");
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(
    new Set(initialAgencyId ? [initialAgencyId] : [])
  );
  const [template, setTemplate] = useState("standard");
  const [tone, setTone] = useState("consultative");
  const [length, setLength] = useState("medium");
  const [includeBenchmarks, setIncludeBenchmarks] = useState(true);
  const [generatedOutput, setGeneratedOutput] = useState("");

  const toggleAgency = (agencyId: string) => {
    const newSelected = new Set(selectedAgencies);
    if (newSelected.has(agencyId)) {
      newSelected.delete(agencyId);
    } else {
      newSelected.add(agencyId);
    }
    setSelectedAgencies(newSelected);
  };

  const generateNarrative = () => {
    if (selectedAgencies.size === 0) {
      setGeneratedOutput("Please select at least one agency to generate meeting prep.");
      return;
    }

    const selectedAgencyData = Array.from(selectedAgencies).map(id => ({
      agency: mockAgencies.find(a => a.agency_id === id)!,
      kpis: mockKPIs[id],
    }));

    let output = "";

    selectedAgencyData.forEach(({ agency, kpis }, index) => {
      if (index > 0) output += "\n\n" + "=".repeat(80) + "\n\n";
      
      output += `MEETING PREPARATION: ${agency.agency_name}\n`;
      output += `${"=".repeat(80)}\n\n`;

      // Opening
      if (tone === "friendly") {
        output += `OPENING:\nHi! Great to see you again. I've been looking forward to catching up and seeing how things are going with your business.\n\n`;
      } else if (tone === "consultative") {
        output += `OPENING:\nThank you for meeting with me today. I'd like to review our partnership performance and discuss strategic opportunities for growth.\n\n`;
      } else {
        output += `OPENING:\nLet's dive into the performance metrics and address the key priorities we need to focus on together.\n\n`;
      }

      // Performance recap
      output += `PERFORMANCE OVERVIEW:\n`;
      output += `• Health Score: ${kpis.overall_health_score}/100`;
      if (includeBenchmarks) {
        output += ` (Portfolio avg: ${mockBenchmarks.avg_overall_health_score.toFixed(0)})`;
      }
      output += `\n`;
      
      output += `• Renewal Rate: ${kpis.renewal_rate}%`;
      if (includeBenchmarks) {
        output += ` vs ${mockBenchmarks.avg_renewal_rate}% avg`;
        output += ` (${kpis.renewal_rate >= mockBenchmarks.avg_renewal_rate ? "+" : ""}${(kpis.renewal_rate - mockBenchmarks.avg_renewal_rate).toFixed(1)} pts)`;
      }
      output += `\n`;

      output += `• Claims Ratio: ${(kpis.claims_ratio * 100).toFixed(0)}%`;
      if (includeBenchmarks) {
        output += ` vs ${(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}% avg`;
      }
      output += `\n`;

      output += `• Premium Volume: $${(kpis.premiums_written_total / 1000000).toFixed(2)}M\n`;
      output += `• Best Branch: ${kpis.growth_best_branch.toUpperCase()} (+${kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]}% YoY)\n\n`;

      // Risks
      output += `RISKS TO ADDRESS:\n`;
      if (kpis.renewal_risk_flag) {
        output += `⚠️ CRITICAL: Renewal rate at ${kpis.renewal_rate}% is ${(mockBenchmarks.avg_renewal_rate - kpis.renewal_rate).toFixed(1)} points below average.\n`;
      }
      if (kpis.claims_ratio > mockBenchmarks.avg_claims_ratio) {
        output += `• Claims ratio elevated - ${((kpis.claims_ratio - mockBenchmarks.avg_claims_ratio) * 100).toFixed(0)} points above benchmark\n`;
      }
      if (kpis.portfolio_concentration > 0.4) {
        output += `• High concentration (${(kpis.portfolio_concentration * 100).toFixed(0)}%) suggests diversification needed\n`;
      }
      if (!kpis.renewal_risk_flag && kpis.claims_ratio <= mockBenchmarks.avg_claims_ratio) {
        output += `• No major risk flags - maintain current performance trajectory\n`;
      }
      output += `\n`;

      // Opportunities
      output += `OPPORTUNITIES:\n`;
      output += `• Leverage ${kpis.growth_best_branch} branch momentum for cross-sell\n`;
      output += `• Address ${kpis.growth_worst_branch} branch underperformance\n`;
      if (kpis.overall_health_score > 80) {
        output += `• Strong health score - opportunity for portfolio expansion\n`;
      }
      output += `\n`;

      // Questions
      output += `KEY QUESTIONS:\n`;
      output += `1. What's driving the strong performance in ${kpis.growth_best_branch}?\n`;
      output += `2. ${kpis.renewal_risk_flag ? "What challenges are affecting customer retention?" : "How can we support continued renewal success?"}\n`;
      output += `3. Are there specific customer segments with high growth potential?\n`;
      output += `4. What resources or support would have the biggest impact?\n`;
      output += `5. How can we improve ${kpis.growth_worst_branch} branch results together?\n\n`;

      // Next steps
      output += `PROPOSED COMMITMENTS:\n`;
      output += `□ Schedule follow-up in ${agency.target_visit_frequency === 'weekly' ? '1 week' : agency.target_visit_frequency === 'monthly' ? '1 month' : '3 months'}\n`;
      output += `□ Provide training on ${kpis.growth_worst_branch} products\n`;
      output += `□ Review detailed claims data\n`;
      output += `□ Create joint quarterly growth plan\n`;
    });

    setGeneratedOutput(output);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Agency Selector */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-900 mb-1">Select Agencies</h3>
          <p className="text-xs text-slate-600">{selectedAgencies.size} selected</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {mockAgencies.map((agency) => {
              const kpis = mockKPIs[agency.agency_id];
              const isSelected = selectedAgencies.has(agency.agency_id);

              return (
                <Card 
                  key={agency.agency_id}
                  className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                  onClick={() => toggleAgency(agency.agency_id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleAgency(agency.agency_id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-slate-900 truncate">{agency.agency_name}</h4>
                          <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'} className="text-xs">
                            {agency.priority_tier}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{agency.city}</p>
                        {kpis.renewal_risk_flag && (
                          <Badge variant="destructive" className="text-xs mt-1">Risk</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Middle: Template & Controls */}
      <div className="w-80 border-r bg-slate-50 flex flex-col">
        <div className="p-4 border-b bg-white">
          <h3 className="font-semibold text-slate-900">Generation Settings</h3>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Template</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Review</SelectItem>
                    <SelectItem value="renewal">Renewal Improvement Plan</SelectItem>
                    <SelectItem value="claims">Claims Ratio Discussion</SelectItem>
                    <SelectItem value="growth">Growth Play</SelectItem>
                    <SelectItem value="concentration">Concentration Risk Mitigation</SelectItem>
                    <SelectItem value="relationship">Relationship Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tone</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="consultative">Consultative</SelectItem>
                    <SelectItem value="assertive">Assertive</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Length</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (5 min)</SelectItem>
                    <SelectItem value="medium">Medium (15 min)</SelectItem>
                    <SelectItem value="long">Long (30 min)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <label htmlFor="benchmarks" className="text-sm text-slate-700">Include Benchmarks</label>
                  <Checkbox
                    id="benchmarks"
                    checked={includeBenchmarks}
                    onCheckedChange={(checked) => setIncludeBenchmarks(checked as boolean)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={generateNarrative}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>

            <Button variant="outline" className="w-full">
              Regenerate with Constraints
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Right: Output */}
      <div className="flex-1 bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Generated Output</h3>
            {generatedOutput && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Save to Notes
                </Button>
                <Button variant="outline" size="sm">
                  Create Tasks
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {generatedOutput ? (
              <Textarea
                value={generatedOutput}
                onChange={(e) => setGeneratedOutput(e.target.value)}
                className="min-h-[calc(100vh-200px)] font-mono text-sm"
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Select agencies and click Generate to create meeting prep</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
