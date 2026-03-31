import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Search, Filter, Sparkles, Calendar, TrendingUp } from "lucide-react";
import { mockAgencies, mockKPIs, mockBenchmarks } from "../../data/mockData";

export function AgenciesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [renewalRiskOnly, setRenewalRiskOnly] = useState(false);
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(new Set());

  // Get unique cities
  const cities = Array.from(new Set(mockAgencies.map(a => a.city))).sort();

  // Filter agencies
  const filteredAgencies = mockAgencies.filter(agency => {
    const kpis = mockKPIs[agency.agency_id];
    
    if (searchQuery && !agency.agency_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTier !== "all" && agency.priority_tier !== selectedTier) {
      return false;
    }
    if (selectedCity !== "all" && agency.city !== selectedCity) {
      return false;
    }
    if (renewalRiskOnly && !kpis.renewal_risk_flag) {
      return false;
    }
    
    return true;
  });

  const toggleAgency = (agencyId: string) => {
    const newSelected = new Set(selectedAgencies);
    if (newSelected.has(agencyId)) {
      newSelected.delete(agencyId);
    } else {
      newSelected.add(agencyId);
    }
    setSelectedAgencies(newSelected);
  };

  const toggleAll = () => {
    if (selectedAgencies.size === filteredAgencies.length) {
      setSelectedAgencies(new Set());
    } else {
      setSelectedAgencies(new Set(filteredAgencies.map(a => a.agency_id)));
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Agencies</h1>
            <p className="text-slate-600 mt-1">{filteredAgencies.length} agencies in portfolio</p>
          </div>
          {selectedAgencies.size > 0 && (
            <div className="flex gap-2">
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Narratives ({selectedAgencies.size})
              </Button>
              <Button>
                Create Visit Plan ({selectedAgencies.size})
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search agencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Priority Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="A">Tier A</SelectItem>
              <SelectItem value="B">Tier B</SelectItem>
              <SelectItem value="C">Tier C</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant={renewalRiskOnly ? "default" : "outline"}
            onClick={() => setRenewalRiskOnly(!renewalRiskOnly)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Renewal Risk
          </Button>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <div className="p-8">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedAgencies.size === filteredAgencies.length && filteredAgencies.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>Agency Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Health Score</TableHead>
                    <TableHead className="text-right">Renewal Rate</TableHead>
                    <TableHead className="text-right">Claims Ratio</TableHead>
                    <TableHead className="text-right">Concentration</TableHead>
                    <TableHead>Best Branch</TableHead>
                    <TableHead>Next Visit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgencies.map((agency) => {
                    const kpis = mockKPIs[agency.agency_id];
                    const isSelected = selectedAgencies.has(agency.agency_id);
                    
                    return (
                      <TableRow key={agency.agency_id} className={isSelected ? "bg-blue-50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleAgency(agency.agency_id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Link 
                            to={`/app/agencies/${agency.agency_id}`}
                            className="font-medium text-blue-600 hover:text-blue-700"
                          >
                            {agency.agency_name}
                          </Link>
                          {kpis.renewal_risk_flag && (
                            <Badge variant="destructive" className="ml-2 text-xs">Risk</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{agency.city}</div>
                            <div className="text-slate-500">{agency.district}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'}>
                            {agency.priority_tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={kpis.overall_health_score >= 80 ? "text-green-600 font-medium" : kpis.overall_health_score >= 60 ? "" : "text-red-600 font-medium"}>
                            {kpis.overall_health_score}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <div className={kpis.renewal_rate >= mockBenchmarks.avg_renewal_rate ? "text-green-600" : "text-red-600"}>
                              {kpis.renewal_rate}%
                            </div>
                            <div className="text-xs text-slate-500">
                              vs {mockBenchmarks.avg_renewal_rate}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <div className={kpis.claims_ratio <= mockBenchmarks.avg_claims_ratio ? "text-green-600" : "text-red-600"}>
                              {(kpis.claims_ratio * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-slate-500">
                              vs {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {(kpis.portfolio_concentration * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="capitalize">{kpis.growth_best_branch}</span>
                            <span className="text-slate-500">
                              +{kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(agency.next_recommended_visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              Add to Plan
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Sparkles className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
