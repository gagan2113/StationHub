import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { GitBranch, Search, AlertTriangle, MapPin, Calendar, Clock, FileText, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import type { CrimePattern, PatternStatus } from "@/store/PoliceStore";

const chartStyle = { contentStyle: { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(200,215,240,0.70)", borderRadius: 10, fontSize: 12, color: "hsl(222 47% 11%)" }, cursor: { fill: "rgba(0,0,0,0.04)" } };
const STATUS_COLORS = { Active: "hsl(var(--destructive))", Monitoring: "hsl(var(--warning))", Resolved: "hsl(var(--success))" };

export default function RepeatPatterns() {
  const { crimePatterns, fir, updatePatternStatus } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<CrimePattern | null>(null);

  const categories = [...new Set(crimePatterns.map((p) => p.crimeCategory.split(" ")[0]))];

  const filtered = crimePatterns.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.crimeCategory.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCategory = categoryFilter === "all" || p.crimeCategory.includes(categoryFilter);
    return matchSearch && matchStatus && matchCategory;
  });

  const statusCounts = [
    { name: "Active", value: crimePatterns.filter((p) => p.status === "Active").length },
    { name: "Monitoring", value: crimePatterns.filter((p) => p.status === "Monitoring").length },
    { name: "Resolved", value: crimePatterns.filter((p) => p.status === "Resolved").length },
  ];

  const categoryData = Object.entries(
    crimePatterns.reduce<Record<string, number>>((acc, p) => {
      const cat = p.crimeCategory.split(" ")[0];
      acc[cat] = (acc[cat] || 0) + p.incidentCount;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count }));

  const relatedFIRs = (pattern: CrimePattern) => fir.filter((f) => pattern.relatedFIRs.includes(f.id));

  const handleStatus = (id: string, status: PatternStatus) => {
    updatePatternStatus(id, status);
    toast.success(`Pattern status updated to ${status}`);
    setSelected(null);
  };

  return (
    <AppLayout title="Repeat Crime Pattern Detection">
      <div className="space-y-5">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-info/5 border border-info/20 text-sm text-muted-foreground">
          <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
          <span><strong className="text-foreground">Analytical grouping only. </strong>Cases grouped by category, area, and date. Patterns do not imply that cases are connected or that the same person is responsible. Verified operational intelligence requires investigation.</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Patterns", value: crimePatterns.length, color: "text-primary" },
            { label: "Active", value: crimePatterns.filter((p) => p.status === "Active").length, color: "text-destructive" },
            { label: "Under Monitoring", value: crimePatterns.filter((p) => p.status === "Monitoring").length, color: "text-warning" },
            { label: "Total Linked FIRs", value: crimePatterns.reduce((s, p) => s + p.relatedFIRs.length, 0), color: "text-info" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Pattern Status</h3>
            <p className="text-xs text-muted-foreground mb-4">Breakdown by current investigation status</p>
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                    {statusCounts.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name as PatternStatus]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-1">
              {statusCounts.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[d.name as PatternStatus] }} /><span className="text-muted-foreground">{d.name}</span></div>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Incidents by Crime Category</h3>
            <p className="text-xs text-muted-foreground mb-4">Total incidents across all patterns</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={60} />
                  <Tooltip {...chartStyle} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patterns..." className="pl-8 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Monitoring">Monitoring</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} patterns</span>
          </div>
        </Card>

        {/* Pattern cards */}
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} onClick={() => setSelected(p)} className={`p-5 cursor-pointer hover:bg-muted/20 transition-colors border-l-4 ${p.status === "Active" ? "border-l-destructive" : p.status === "Monitoring" ? "border-l-warning" : "border-l-success"}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-sm">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.area}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{p.timeRange}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.frequency}</span>
                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{p.relatedFIRs.length} FIRs</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="text-2xl font-bold text-foreground">{p.incidentCount}</div>
                  <div className="text-xs text-muted-foreground">incidents</div>
                  <Badge variant="outline" className="text-xs">{p.crimeCategory.split(" ")[0]}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <Card className="p-10 text-center">
              <GitBranch className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-muted-foreground text-sm">No patterns match the current filters.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-base leading-tight">{selected.title}</SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.crimeCategory} · {selected.area}</p>
              </SheetHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <StatusBadge status={selected.status} />
                  <Badge variant="outline" className="text-xs">{selected.incidentCount} incidents</Badge>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <div className="text-xs text-muted-foreground mb-1">Pattern Description</div>
                  <p className="text-sm leading-relaxed">{selected.description}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Analyst Note</div>
                  <p className="text-sm leading-relaxed text-foreground">{selected.patternNote}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">First Incident</div>
                    <div className="text-sm font-medium">{selected.firstIncident}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Last Incident</div>
                    <div className="text-sm font-medium">{selected.lastIncident}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Frequency</div>
                    <div className="text-sm font-medium">{selected.frequency}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Time Range</div>
                    <div className="text-sm font-medium">{selected.timeRange}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Incident Locations</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.locations.map((l) => <Badge key={l} variant="outline" className="text-xs"><MapPin className="h-2.5 w-2.5 mr-1" />{l}</Badge>)}
                  </div>
                </div>
                {relatedFIRs(selected).length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Linked FIRs ({relatedFIRs(selected).length})</div>
                    <div className="space-y-1.5">
                      {relatedFIRs(selected).map((f) => (
                        <div key={f.id} className="p-2.5 rounded-lg bg-muted/40 border flex items-center justify-between">
                          <div>
                            <div className="font-mono text-xs text-primary">{f.firNumber}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{f.crimeType} · {f.date} · {f.station}</div>
                          </div>
                          <StatusBadge status={f.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2 flex flex-wrap gap-2">
                  {selected.status === "Active" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleStatus(selected.id, "Monitoring")}>Move to Monitoring</Button>
                      <Button size="sm" variant="outline" onClick={() => handleStatus(selected.id, "Resolved")}>Mark Resolved</Button>
                    </>
                  )}
                  {selected.status === "Monitoring" && (
                    <Button size="sm" variant="outline" onClick={() => handleStatus(selected.id, "Resolved")}>Mark Resolved</Button>
                  )}
                  {selected.status === "Resolved" && (
                    <Button size="sm" variant="outline" onClick={() => handleStatus(selected.id, "Active")}>Reopen as Active</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
