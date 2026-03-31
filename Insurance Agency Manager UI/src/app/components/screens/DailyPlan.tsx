import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, GripVertical, Sparkles, MapPin, Clock, Target } from "lucide-react";
import { mockAgencies, mockKPIs, mockDailyPlan } from "../../data/mockData";

interface VisitCardProps {
  visit: {
    id: string;
    agency_id: string;
    goal: string;
    time_window: string;
    notes: string;
    order: number;
  };
  index: number;
  moveVisit: (dragIndex: number, hoverIndex: number) => void;
  onSelect: () => void;
  isSelected: boolean;
}

function VisitCard({ visit, index, moveVisit, onSelect, isSelected }: VisitCardProps) {
  const agency = mockAgencies.find(a => a.agency_id === visit.agency_id)!;
  const kpis = mockKPIs[visit.agency_id];

  const [{ isDragging }, drag] = useDrag({
    type: "visit",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "visit",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveVisit(item.index, index);
        item.index = index;
      }
    },
  });

  const goalColors = {
    renewal: "bg-red-100 text-red-700",
    claims: "bg-amber-100 text-amber-700",
    "cross-sell": "bg-green-100 text-green-700",
    relationship: "bg-blue-100 text-blue-700",
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`cursor-move ${isDragging ? "opacity-50" : ""}`}
      onClick={onSelect}
    >
      <Card className={`mb-3 hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <GripVertical className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{agency.agency_name}</h4>
                  <p className="text-sm text-slate-600">{agency.city} · {agency.district}</p>
                </div>
                <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'} className="text-xs">
                  {agency.priority_tier}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={`text-xs ${goalColors[visit.goal as keyof typeof goalColors]}`}>
                  {visit.goal}
                </Badge>
                {kpis.renewal_risk_flag && (
                  <Badge variant="destructive" className="text-xs">Risk</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {visit.time_window}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {agency.preferred_visit_time_window}
                </span>
              </div>

              <Button variant="ghost" size="sm" className="mt-2 w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Prep
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DailyPlanContent() {
  const [visits, setVisits] = useState(mockDailyPlan);
  const [selectedVisit, setSelectedVisit] = useState<string | null>(visits[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPreset, setFilterPreset] = useState("all");

  const moveVisit = (dragIndex: number, hoverIndex: number) => {
    const newVisits = [...visits];
    const [removed] = newVisits.splice(dragIndex, 1);
    newVisits.splice(hoverIndex, 0, removed);
    setVisits(newVisits.map((v, i) => ({ ...v, order: i + 1 })));
  };

  // Candidate pool agencies (not in plan)
  const plannedAgencyIds = new Set(visits.map(v => v.agency_id));
  const candidateAgencies = mockAgencies.filter(a => !plannedAgencyIds.has(a.agency_id));

  const filteredCandidates = candidateAgencies.filter(agency => {
    const kpis = mockKPIs[agency.agency_id];
    
    if (searchQuery && !agency.agency_name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    if (filterPreset === "renewal-risk" && !kpis.renewal_risk_flag) {
      return false;
    }
    
    if (filterPreset === "high-growth" && kpis.overall_health_score < 80) {
      return false;
    }
    
    return true;
  });

  const selectedVisitData = visits.find(v => v.id === selectedVisit);
  const selectedAgency = selectedVisitData ? mockAgencies.find(a => a.agency_id === selectedVisitData.agency_id) : null;

  const addToVisits = (agencyId: string) => {
    const newVisit = {
      id: `V${Date.now()}`,
      agency_id: agencyId,
      goal: "relationship" as const,
      time_window: "TBD",
      notes: "",
      order: visits.length + 1,
    };
    setVisits([...visits, newVisit]);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Candidate Pool */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-900 mb-3">Candidate Pool</h3>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search agencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterPreset} onValueChange={setFilterPreset}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agencies</SelectItem>
              <SelectItem value="due-this-week">Due This Week</SelectItem>
              <SelectItem value="renewal-risk">Renewal Risk</SelectItem>
              <SelectItem value="high-growth">High Growth</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredCandidates.map((agency) => {
              const kpis = mockKPIs[agency.agency_id];
              return (
                <Card key={agency.agency_id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-slate-900 truncate">{agency.agency_name}</h4>
                        <p className="text-xs text-slate-600">{agency.city}</p>
                      </div>
                      <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'} className="text-xs">
                        {agency.priority_tier}
                      </Badge>
                    </div>
                    {kpis.renewal_risk_flag && (
                      <Badge variant="destructive" className="text-xs mb-2">Risk</Badge>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => addToVisits(agency.agency_id)}
                    >
                      Add to Plan
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Middle: Planned Visits */}
      <div className="flex-1 flex flex-col bg-slate-50">
        <div className="p-6 bg-white border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Today's Plan</h2>
              <p className="text-sm text-slate-600">{visits.length} visits planned</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <MapPin className="w-4 h-4 mr-2" />
                Optimize Route
              </Button>
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate All Narratives
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            {visits.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No visits planned yet. Add agencies from the candidate pool.</p>
              </div>
            ) : (
              <div>
                {visits.map((visit, index) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    index={index}
                    moveVisit={moveVisit}
                    onSelect={() => setSelectedVisit(visit.id)}
                    isSelected={selectedVisit === visit.id}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Visit Detail Panel */}
      <div className="w-96 border-l bg-white flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-slate-900">Visit Details</h3>
        </div>

        {selectedVisitData && selectedAgency ? (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">{selectedAgency.agency_name}</h4>
                <p className="text-sm text-slate-600">{selectedAgency.city} · {selectedAgency.district}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Meeting Objective</label>
                <Select defaultValue={selectedVisitData.goal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="renewal">Renewal Discussion</SelectItem>
                    <SelectItem value="claims">Claims Review</SelectItem>
                    <SelectItem value="cross-sell">Cross-sell Opportunity</SelectItem>
                    <SelectItem value="relationship">Relationship Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Time Window</label>
                <Input defaultValue={selectedVisitData.time_window} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Notes</label>
                <Textarea 
                  placeholder="Add notes for this visit..." 
                  defaultValue={selectedVisitData.notes}
                  rows={4}
                />
              </div>

              <div>
                <Button className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Meeting Prep
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-2">Checklist</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Review agency KPIs
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Prepare talking points
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    Review last meeting notes
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-slate-900 mb-2">After Visit</h4>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Outcome</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select outcome..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="risk">Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm text-slate-600 text-center">
              Select a visit to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function DailyPlan() {
  return (
    <DndProvider backend={HTML5Backend}>
      <DailyPlanContent />
    </DndProvider>
  );
}
