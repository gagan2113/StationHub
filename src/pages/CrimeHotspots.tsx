import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from "recharts";
import { MapPin, Flame, TrendingUp, TrendingDown, Minus, AlertTriangle, List, Map } from "lucide-react";
import type { HotspotArea } from "@/store/PoliceStore";

const SEVERITY_COLOR: Record<string, string> = {
  Critical: "bg-destructive",
  High: "bg-destructive/70",
  Moderate: "bg-warning",
  Low: "bg-success",
};

const SEVERITY_RING: Record<string, string> = {
  Critical: "ring-4 ring-destructive/40 shadow-[0_0_20px_4px] shadow-destructive/30",
  High: "ring-2 ring-destructive/30",
  Moderate: "ring-2 ring-warning/30",
  Low: "ring-1 ring-success/20",
};

const SEVERITY_SIZE: Record<string, number> = { Critical: 28, High: 22, Moderate: 18, Low: 14 };

const chartStyle = { contentStyle: { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(200,215,240,0.70)", borderRadius: 10, fontSize: 12, color: "hsl(222 47% 11%)" }, cursor: { fill: "rgba(0,0,0,0.04)" } };

export default function CrimeHotspots() {
  const { hotspots, fir } = useStore();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selected, setSelected] = useState<HotspotArea | null>(null);
  const [view, setView] = useState<"map" | "list">("map");

  const filtered = hotspots.filter((h) => severityFilter === "all" || h.severity === severityFilter);

  const relatedFIRs = (hs: HotspotArea) => fir.filter((f) => hs.recentIncidents.includes(f.id));

  const trendIcon = (t: string) => t === "Increasing" ? <TrendingUp className="h-3.5 w-3.5 text-destructive" /> : t === "Decreasing" ? <TrendingDown className="h-3.5 w-3.5 text-success" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;

  return (
    <AppLayout title="Crime Hotspot Detection">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Geographic crime intelligence — Delhi region.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="tab-toggle">
              <button onClick={() => setView("map")} className={`tab-toggle-item ${view === "map" ? "active" : ""}`}><Map className="h-3.5 w-3.5" />Map</button>
              <button onClick={() => setView("list")} className={`tab-toggle-item ${view === "list" ? "active" : ""}`}><List className="h-3.5 w-3.5" />List</button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Hotspots", value: hotspots.length, color: "text-primary" },
            { label: "Critical Areas", value: hotspots.filter((h) => h.severity === "Critical").length, color: "text-destructive" },
            { label: "Increasing Trend", value: hotspots.filter((h) => h.trend === "Increasing").length, color: "text-warning" },
            { label: "Total Incidents", value: hotspots.reduce((s, h) => s + h.incidentCount, 0), color: "text-info" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {view === "map" ? (
          /* SVG Map View */
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Delhi Region — Crime Hotspot Map</h3>
                <p className="text-xs text-muted-foreground">Marker size indicates incident count; colour indicates severity.</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {[{ label: "Critical", c: "bg-destructive" }, { label: "High", c: "bg-destructive/60" }, { label: "Moderate", c: "bg-warning" }, { label: "Low", c: "bg-success" }].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-full ${l.c}`} />{l.label}</div>
                ))}
              </div>
            </div>
            <div
              className="relative w-full overflow-hidden rounded-xl"
              style={{
                height: 480,
                background: "rgba(230,238,255,0.60)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(200,215,240,0.55)",
                boxShadow: "0 4px 24px rgba(100,130,200,0.12), inset 0 0 60px rgba(37,99,235,0.03)",
              }}
            >
              {/* SVG grid map of Delhi */}
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Background */}
                <rect width="100" height="100" fill="rgba(220,232,255,0.35)" rx="2" />
                {/* Grid lines */}
                {[20, 40, 60, 80].map((v) => (
                  <g key={v}>
                    <line x1={v} y1="0" x2={v} y2="100" stroke="hsl(var(--border))" strokeWidth="0.3" />
                    <line x1="0" y1={v} x2="100" y2={v} stroke="hsl(var(--border))" strokeWidth="0.3" />
                  </g>
                ))}
                {/* District labels */}
                <text x="50" y="48" textAnchor="middle" fontSize="3" fill="hsl(var(--muted-foreground))" opacity="0.5">CENTRAL</text>
                <text x="28" y="35" textAnchor="middle" fontSize="2.5" fill="hsl(var(--muted-foreground))" opacity="0.5">WEST</text>
                <text x="25" y="18" textAnchor="middle" fontSize="2.5" fill="hsl(var(--muted-foreground))" opacity="0.5">NW DELHI</text>
                <text x="18" y="62" textAnchor="middle" fontSize="2.5" fill="hsl(var(--muted-foreground))" opacity="0.5">SW DELHI</text>
                <text x="45" y="72" textAnchor="middle" fontSize="2.5" fill="hsl(var(--muted-foreground))" opacity="0.5">SOUTH</text>
                <text x="72" y="42" textAnchor="middle" fontSize="2.5" fill="hsl(var(--muted-foreground))" opacity="0.5">EAST</text>
                {/* Yamuna river (stylized) */}
                <path d="M65,5 Q70,25 68,45 Q66,65 70,85 Q72,90 75,95" stroke="hsl(var(--info))" strokeWidth="1.5" fill="none" opacity="0.3" />
                {/* Ring road (stylized) */}
                <ellipse cx="50" cy="50" rx="35" ry="40" stroke="hsl(var(--border))" strokeWidth="0.6" fill="none" strokeDasharray="2,2" opacity="0.5" />
                {/* Hotspot markers */}
                {filtered.map((hs) => {
                  const size = SEVERITY_SIZE[hs.severity] / 10;
                  const isSelected = selected?.id === hs.id;
                  return (
                    <g key={hs.id} onClick={() => setSelected(hs)} style={{ cursor: "pointer" }}>
                      {/* Pulse ring for critical */}
                      {hs.severity === "Critical" && (
                        <circle cx={hs.coordinates.x} cy={hs.coordinates.y} r={size + 2.5} fill="hsl(var(--destructive))" opacity="0.2" />
                      )}
                      <circle
                        cx={hs.coordinates.x}
                        cy={hs.coordinates.y}
                        r={size}
                        fill={hs.severity === "Critical" ? "hsl(var(--destructive))" : hs.severity === "High" ? "hsl(var(--destructive)/0.7)" : hs.severity === "Moderate" ? "hsl(var(--warning))" : "hsl(var(--success))"}
                        opacity="0.85"
                        stroke={isSelected ? "white" : "none"}
                        strokeWidth={isSelected ? 0.8 : 0}
                      />
                      <text x={hs.coordinates.x} y={hs.coordinates.y + 0.7} textAnchor="middle" fontSize="2.2" fill="white" fontWeight="600">{hs.incidentCount}</text>
                      {/* Label */}
                      <text x={hs.coordinates.x} y={hs.coordinates.y + size + 2.5} textAnchor="middle" fontSize="2.2" fill="hsl(var(--foreground))" opacity="0.8">
                        {hs.areaName.split(" ").slice(0, 2).join(" ")}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {/* Info overlay */}
              <div
                className="absolute bottom-3 left-3 text-xs px-2.5 py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.88)", backdropFilter: "blur(12px)", border: "1px solid rgba(200,215,240,0.70)", color: "hsl(220 13% 46%)", boxShadow: "0 2px 8px rgba(100,130,200,0.12)" }}
              >
                Click a marker to view hotspot details
              </div>
            </div>
          </Card>
        ) : (
          /* List View */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr><th>Area</th><th>District</th><th>Incidents</th><th>Primary Crime</th><th>Severity</th><th>Trend</th><th>Last Updated</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.sort((a, b) => b.incidentCount - a.incidentCount).map((hs) => (
                    <tr key={hs.id} onClick={() => setSelected(hs)} className="cursor-pointer">
                      <td className="font-medium text-sm">{hs.areaName}</td>
                      <td className="text-xs text-muted-foreground">{hs.district}</td>
                      <td className="font-bold text-sm">{hs.incidentCount}</td>
                      <td className="text-xs">{hs.crimeCategories[0]?.type ?? "—"}</td>
                      <td><StatusBadge status={hs.severity} /></td>
                      <td>
                        <div className="flex items-center gap-1 text-xs">
                          {trendIcon(hs.trend)}
                          <span className={hs.trend === "Increasing" ? "text-destructive" : hs.trend === "Decreasing" ? "text-success" : "text-muted-foreground"}>{hs.trend}</span>
                        </div>
                      </td>
                      <td className="text-xs text-muted-foreground">{hs.lastUpdated}</td>
                      <td className="text-xs text-primary font-medium">View →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Incident Count by Area</h3>
            <p className="text-xs text-muted-foreground mb-4">All hotspot areas ranked by incident count</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={hotspots.map((h) => ({ name: h.areaName.split(" ").slice(0, 2).join(" "), count: h.incidentCount, severity: h.severity })).sort((a, b) => b.count - a.count)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} />
                  <Tooltip {...chartStyle} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {hotspots.sort((a, b) => b.incidentCount - a.incidentCount).map((h, i) => (
                      <rect key={i} fill={h.severity === "Critical" ? "hsl(var(--destructive))" : h.severity === "High" ? "hsl(var(--warning))" : "hsl(var(--info))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Rohini Sector 3-5 — Weekly Trend</h3>
            <p className="text-xs text-muted-foreground mb-4">Incident count over the past 7 days</p>
            <div className="h-52">
              <ResponsiveContainer>
                <LineChart data={hotspots[2]?.weeklyTrend.map((v, i) => ({ day: `Day ${i + 1}`, incidents: v })) ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...chartStyle} />
                  <Line type="monotone" dataKey="incidents" stroke="hsl(var(--destructive))" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Hotspot detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${SEVERITY_COLOR[selected.severity]}`} />
                  <SheetTitle className="text-base">{selected.areaName}</SheetTitle>
                </div>
                <p className="text-xs text-muted-foreground">{selected.district} · {selected.incidentCount} incidents · Updated {selected.lastUpdated}</p>
              </SheetHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <StatusBadge status={selected.severity} />
                  <Badge variant="outline" className="gap-1 text-xs">{trendIcon(selected.trend)}{selected.trend}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <p className="text-sm leading-relaxed">{selected.description}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Crime Category Breakdown</div>
                  <div className="space-y-2">
                    {selected.crimeCategories.map((c) => (
                      <div key={c.type} className="flex items-center gap-3">
                        <span className="text-sm w-36 truncate">{c.type}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(c.count / selected.incidentCount) * 100}%` }} />
                        </div>
                        <span className="text-xs font-semibold w-6 text-right">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {relatedFIRs(selected).length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Related FIRs</div>
                    <div className="space-y-2">
                      {relatedFIRs(selected).map((f) => (
                        <div key={f.id} className="p-2.5 rounded-lg bg-muted/40 border flex items-center justify-between">
                          <div>
                            <div className="font-mono text-xs text-primary">{f.firNumber}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{f.crimeType} · {f.date}</div>
                          </div>
                          <StatusBadge status={f.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.weeklyTrend.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">7-Day Incident Trend</div>
                    <div className="h-28">
                      <ResponsiveContainer>
                        <LineChart data={selected.weeklyTrend.map((v, i) => ({ day: `D${i + 1}`, incidents: v }))}>
                          <XAxis dataKey="day" fontSize={10} stroke="hsl(var(--muted-foreground))" />
                          <YAxis fontSize={10} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip {...chartStyle} />
                          <Line type="monotone" dataKey="incidents" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
