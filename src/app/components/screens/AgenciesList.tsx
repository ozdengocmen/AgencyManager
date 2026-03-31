import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
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
import { useAppState } from "../../state";
import { toast } from "sonner";
import { getAgenciesListCopy } from "./agenciesListCopy";
import { getOpenInAssistantLabel, openInAssistant } from "../ai/assistantUtils";

export function AgenciesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [renewalRiskOnly, setRenewalRiskOnly] = useState(false);
  const [selectedAgencies, setSelectedAgencies] = useState<Set<string>>(new Set());
  const {
    state: { settings },
    addAgencyToPlan,
  } = useAppState();
  const copy = getAgenciesListCopy(settings.language);
  const openAssistantLabel = getOpenInAssistantLabel(settings.language);

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

  const addSelectedToPlan = () => {
    let addedCount = 0;
    selectedAgencies.forEach((agencyId) => {
      if (addAgencyToPlan(agencyId)) {
        addedCount += 1;
      }
    });
    if (addedCount === 0) {
      toast.message(copy.addSelectedAlreadyInPlan);
      return;
    }
    toast.success(copy.addedSelectedToPlan(addedCount));
  };

  const addSingleToPlan = (agencyId: string) => {
    const added = addAgencyToPlan(agencyId);
    if (!added) {
      toast.message(copy.agencyAlreadyInPlan);
      return;
    }
    toast.success(copy.addedAgencyToPlan(agencyId));
  };

  const openAiAssistantForAgencies = (agencyIds: string[]) => {
    const knownAgencyIds = new Set(mockAgencies.map((agency) => agency.agency_id));
    const nextSelectedAgencyIds = agencyIds.filter((agencyId) => knownAgencyIds.has(agencyId));
    if (nextSelectedAgencyIds.length === 0) {
      toast.error(copy.selectAgencyForMeetingPrep);
      return;
    }

    const selectedNames = mockAgencies
      .filter((agency) => nextSelectedAgencyIds.includes(agency.agency_id))
      .map((agency) => `${agency.agency_name} (${agency.agency_id})`);
    const prompt =
      settings.language === "tr"
        ? `Asagidaki acenteler icin toplanti hazirligi uret: ${selectedNames.join(", ")}. Sayisal metrikleri ve aksiyonlari dahil et.`
        : `Generate meeting prep for these agencies: ${selectedNames.join(", ")}. Include numeric metrics and action items.`;
    openInAssistant(navigate, location, prompt);
  };

  return (
    <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="border-b bg-white px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{copy.title}</h1>
            <p className="text-slate-600 mt-1">{copy.subtitle(filteredAgencies.length)}</p>
          </div>
          {selectedAgencies.size > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => openAiAssistantForAgencies(Array.from(selectedAgencies))}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {openAssistantLabel}
              </Button>
              <Button onClick={addSelectedToPlan}>
                {copy.createVisitPlanBulkAction(selectedAgencies.size)}
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={copy.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={copy.cityPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.allCities}</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTier} onValueChange={setSelectedTier}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={copy.priorityTierPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{copy.allTiers}</SelectItem>
              <SelectItem value="A">{copy.tierLabel("A")}</SelectItem>
              <SelectItem value="B">{copy.tierLabel("B")}</SelectItem>
              <SelectItem value="C">{copy.tierLabel("C")}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={renewalRiskOnly ? "default" : "outline"}
            onClick={() => setRenewalRiskOnly(!renewalRiskOnly)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {copy.renewalRiskFilter}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="w-max min-w-full p-8">
          <Card className="min-w-[1200px]">
            <CardContent className="p-0">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedAgencies.size === filteredAgencies.length && filteredAgencies.length > 0}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    <TableHead>{copy.tableAgencyName}</TableHead>
                    <TableHead>{copy.tableLocation}</TableHead>
                    <TableHead>{copy.tableTier}</TableHead>
                    <TableHead className="text-right">{copy.tableHealthScore}</TableHead>
                    <TableHead className="text-right">{copy.tableRenewalRate}</TableHead>
                    <TableHead className="text-right">{copy.tableClaimsRatio}</TableHead>
                    <TableHead className="text-right">{copy.tableConcentration}</TableHead>
                    <TableHead>{copy.tableBestBranch}</TableHead>
                    <TableHead>{copy.tableNextVisit}</TableHead>
                    <TableHead>{copy.tableActions}</TableHead>
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
                            <Badge variant="destructive" className="ml-2 text-xs">{copy.riskBadge}</Badge>
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
                              {copy.versusLabel} {mockBenchmarks.avg_renewal_rate}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <div className={kpis.claims_ratio <= mockBenchmarks.avg_claims_ratio ? "text-green-600" : "text-red-600"}>
                              {(kpis.claims_ratio * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-slate-500">
                              {copy.versusLabel} {(mockBenchmarks.avg_claims_ratio * 100).toFixed(0)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {(kpis.portfolio_concentration * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span>{copy.growthBranchLabel(kpis.growth_best_branch)}</span>
                            <span className="text-slate-500">
                              +{kpis[`yoy_growth_${kpis.growth_best_branch}` as keyof typeof kpis]}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(agency.next_recommended_visit_date).toLocaleDateString(copy.dateLocale, { month: 'short', day: 'numeric' })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addSingleToPlan(agency.agency_id)}
                            >
                              {copy.addToPlanAction}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAiAssistantForAgencies([agency.agency_id])}
                            >
                              <Sparkles className="w-4 h-4 mr-1" />
                              {openAssistantLabel}
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
    </div>
  );
}
