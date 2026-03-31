import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { MapPin, Navigation } from "lucide-react";
import { mockAgencies, mockKPIs } from "../../data/mockData";

export function MapClusters() {
  const [numClusters, setNumClusters] = useState([3]);
  const [weightByPriority, setWeightByPriority] = useState(true);
  const [clusters, setClusters] = useState<Array<{ id: number; agencies: typeof mockAgencies; center: [number, number] }>>([]);

  // Simple K-means clustering (simplified for demo)
  const createClusters = () => {
    const k = numClusters[0];
    const agencies = [...mockAgencies];
    
    // Weight agencies by priority
    const weightedAgencies = weightByPriority 
      ? agencies.sort((a, b) => {
          const tierWeight = { A: 3, B: 2, C: 1 };
          return tierWeight[b.priority_tier] - tierWeight[a.priority_tier];
        })
      : agencies;

    // Simple clustering by dividing agencies into k groups
    const newClusters = [];
    const chunkSize = Math.ceil(weightedAgencies.length / k);
    
    for (let i = 0; i < k; i++) {
      const clusterAgencies = weightedAgencies.slice(i * chunkSize, (i + 1) * chunkSize);
      if (clusterAgencies.length > 0) {
        // Calculate center point
        const avgLat = clusterAgencies.reduce((sum, a) => sum + a.latitude, 0) / clusterAgencies.length;
        const avgLon = clusterAgencies.reduce((sum, a) => sum + a.longitude, 0) / clusterAgencies.length;
        
        newClusters.push({
          id: i + 1,
          agencies: clusterAgencies,
          center: [avgLat, avgLon] as [number, number],
        });
      }
    }
    
    setClusters(newClusters);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Map View */}
      <div className="flex-1 bg-slate-100 relative">
        {/* Simplified map placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-3xl mx-auto p-8">
            <div className="absolute inset-0 bg-white/50 rounded-lg border-2 border-slate-300 overflow-hidden">
              {/* Map grid */}
              <div className="absolute inset-0" style={{
                backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }} />
              
              {/* Agency pins */}
              {mockAgencies.map((agency, idx) => {
                const kpis = mockKPIs[agency.agency_id];
                const clusterColor = clusters.find(c => c.agencies.some(a => a.agency_id === agency.agency_id));
                const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
                const color = clusterColor ? colors[(clusterColor.id - 1) % colors.length] : "#64748b";
                
                // Position based on lat/lon (simplified mapping)
                const x = ((agency.longitude + 74.1) * 100);
                const y = ((40.85 - agency.latitude) * 100);
                
                return (
                  <div
                    key={agency.agency_id}
                    className="absolute group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-125 transition-transform"
                      style={{ backgroundColor: color }}
                    >
                      {agency.priority_tier}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        <div className="font-semibold">{agency.agency_name}</div>
                        <div className="text-slate-300">{agency.city}</div>
                        <div className="mt-1">
                          Health: {kpis.overall_health_score}
                          {kpis.renewal_risk_flag && <span className="text-red-400 ml-2">⚠️</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Cluster centers */}
              {clusters.map((cluster) => {
                const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];
                const color = colors[(cluster.id - 1) % colors.length];
                const x = ((cluster.center[1] + 74.1) * 100);
                const y = ((40.85 - cluster.center[0]) * 100);
                
                return (
                  <div
                    key={cluster.id}
                    className="absolute"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full border-4 border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {cluster.id}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span>Tier A - Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <span>Agency Location</span>
                </div>
                {clusters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-600"></div>
                    <span>Cluster Center</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Clustering Panel */}
      <div className="w-96 border-l bg-white flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-slate-900">Clustering</h2>
          <p className="text-sm text-slate-600 mt-1">Create optimal visit clusters</p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Algorithm Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Number of Clusters: {numClusters[0]}</Label>
                  <Slider
                    value={numClusters}
                    onValueChange={setNumClusters}
                    min={2}
                    max={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weight-priority" className="text-sm">Weight by Priority</Label>
                  <Switch
                    id="weight-priority"
                    checked={weightByPriority}
                    onCheckedChange={setWeightByPriority}
                  />
                </div>

                <Button className="w-full" onClick={createClusters}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Create Clusters
                </Button>
              </CardContent>
            </Card>

            {/* Cluster Results */}
            {clusters.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900">Cluster Results</h3>
                
                {clusters.map((cluster) => {
                  const colors = ["bg-blue-600", "bg-red-600", "bg-green-600", "bg-amber-600", "bg-purple-600"];
                  const bgColor = colors[(cluster.id - 1) % colors.length];
                  
                  // Calculate total premiums for cluster
                  const totalPremiums = cluster.agencies.reduce((sum, a) => {
                    return sum + mockKPIs[a.agency_id].premiums_written_total;
                  }, 0);

                  return (
                    <Card key={cluster.id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${bgColor} text-white flex items-center justify-center font-bold`}>
                            {cluster.id}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">Cluster {cluster.id}</CardTitle>
                            <p className="text-xs text-slate-600">{cluster.agencies.length} agencies</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <p className="text-slate-600">Total Value</p>
                          <p className="font-semibold">${(totalPremiums / 1000000).toFixed(1)}M</p>
                        </div>

                        <div className="border-t pt-3">
                          <p className="text-xs font-medium text-slate-700 mb-2">Agencies in cluster:</p>
                          <div className="space-y-2">
                            {cluster.agencies.map((agency, idx) => {
                              const kpis = mockKPIs[agency.agency_id];
                              return (
                                <div key={agency.agency_id} className="text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1">
                                      <span className="text-slate-600">{idx + 1}.</span>
                                      <span className="font-medium">{agency.agency_name}</span>
                                    </span>
                                    <Badge variant={agency.priority_tier === 'A' ? 'default' : 'secondary'} className="text-xs">
                                      {agency.priority_tier}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-500 ml-4">{agency.city}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            Add to Plan
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Route
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                <Button className="w-full" variant="outline">
                  Create 3-Day Plan from Clusters
                </Button>
              </div>
            )}

            {clusters.length === 0 && (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-sm text-slate-600">
                    Configure settings and click "Create Clusters" to generate optimal visit groups.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
