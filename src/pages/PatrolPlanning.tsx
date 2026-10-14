import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navigation, MapPin, Clock, AlertTriangle, CheckCircle2, User, FileText, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { PatrolRecommendation, PatrolStatus } from "@/store/PoliceStore";
import { officers } from "@/store/PoliceStore";

const chartStyle = { contentStyle: { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(200,215,240,0.70)", borderRadius: 10, fontSize: 12, color: "hsl(222 47% 11%)" }, cursor: { fill: "rgba(0,0,0,0.04)" } };

export default function PatrolPlanning() {
  const { patrolRecommendations, fir, hotspots, updatePatrolStatus } = useStore();
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PatrolRecommendation | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignRec, setAssignRec] = useState<PatrolRecommendation | null>(null);
  const [assignOfficer, setAssignOfficer] = useState("");
  const [assignTime, setAssignTime] = useState("");

  const filtered = patrolRecommendations.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.area.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q);
    const matchPriority = priorityFilter === "all" || r.priority === priorityFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchPriority && matchStatus;
  });

  const summary = {
    total: patrolRecommendations.length,
    pending: patrolRecommendations.filter((r) => r.status === "Pending").length,
    accepted: patrolRecommendations.filter((r) => r.status === "Accepted").length,
    critical: patrolRecommendations.filter((r) => r.priority === "Critical").length,
  };

  const priorityData = (["Critical", "High", "Medium", "Low"] as const).map((p) => ({
    name: p,
    count: patrolRecommendations.filter((r) => r.priority === p).length,
  }));

  const handleAction = (rec: PatrolRecommendation, action: PatrolStatus) => {
    updatePatrolStatus(rec.id, action);
    toast.success(`Recommendation ${action.toLowerCase()}`);
    setSelected(null);
  };

  const openAssign = (rec: PatrolRecommendation) => {
    setAssignRec(rec);
    setAssignOfficer(rec.assignedOfficer ?? "");
    setAssignTime(rec.scheduledTime ?? "");
    setAssignDialogOpen(true);
  };

  const confirmAssign = () => {
    if (!assignRec) return;
    updatePatrolStatus(assignRec.id, "Accepted", assignOfficer || undefined, assignTime || undefined);
    toast.success(`Patrol task assigned to ${assignOfficer || "unspecified officer"}`);
    setAssignDialogOpen(false);
    setSelected(null);
  };

  const relatedFIRs = (rec: PatrolRecommendation) => fir.filter((f) => rec.relatedCases.includes(f.id));
  const relatedHotspot = (rec: PatrolRecommendation) => hotspots.find((h) => h.id === rec.relatedHotspot);

  return (
    <AppLayout title="Patrol Planning">
      <div className="space-y-5">
        <p className="text-muted-foreground text-sm">Recommendations based on crime pattern analysis and hotspot intelligence. Not automated dispatch — analyst review required.</p>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Recommendations", value: summary.total, color: "text-primary", icon: Navigation },
            { label: "Pending Review", value: summary.pending, color: "text-warning", icon: AlertTriangle },
            { label: "Accepted / Scheduled", value: summary.accepted, color: "text-success", icon: CheckCircle2 },
            { label: "Critical Priority", value: summary.critical, color: "text-destructive", icon: AlertTriangle },
          ].map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chart */}
          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">By Priority Level</h3>
            <p className="text-xs text-muted-foreground mb-4">Recommendation distribution</p>
            <div className="h-40">
              <ResponsiveContainer>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <Tooltip {...chartStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, i) => (
                      <rect key={i} fill={entry.name === "Critical" || entry.name === "High" ? "hsl(var(--destructive))" : entry.name === "Medium" ? "hsl(var(--warning))" : "hsl(var(--success))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Critical alerts */}
          <Card className="lg:col-span-2 p-5">
            <h3 className="font-semibold mb-1 text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" />Critical / High Priority Requiring Action</h3>
            <p className="text-xs text-muted-foreground mb-3">Items pending review</p>
            <div className="space-y-2">
              {patrolRecommendations.filter((r) => (r.priority === "Critical" || r.priority === "High") && r.status === "Pending").map((r) => (
                <div key={r.id} onClick={() => setSelected(r)} className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 cursor-pointer hover:bg-destructive/10 transition-colors flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.priority} />
                      <span className="text-sm font-medium">{r.area}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.reason}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{r.crimeTypes[0]}</span>
                </div>
              ))}
              {patrolRecommendations.filter((r) => (r.priority === "Critical" || r.priority === "High") && r.status === "Pending").length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">No critical/high items pending review.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search area or reason..." className="pl-8 h-9" />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} recommendations</span>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Area</th><th>Priority</th><th>Status</th><th>Recent Incidents</th><th>Crime Types</th><th>Time Window</th><th>Assigned Officer</th><th>Created</th></tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelected(r)} className="cursor-pointer">
                    <td className="font-medium text-sm">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        {r.area}
                      </div>
                    </td>
                    <td><StatusBadge status={r.priority} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="font-bold text-sm">{r.recentIncidents}</td>
                    <td className="text-xs text-muted-foreground max-w-[160px] truncate">{r.crimeTypes.join(", ")}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.suggestedTimeWindow}</div>
                    </td>
                    <td className="text-sm">{r.assignedOfficer ?? <span className="text-muted-foreground text-xs">Unassigned</span>}</td>
                    <td className="text-xs text-muted-foreground">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center"><Navigation className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" /><p className="text-muted-foreground text-sm">No recommendations match the current filters.</p></div>
          )}
        </Card>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-base">{selected.area}</SheetTitle>
                <p className="text-xs text-muted-foreground">{selected.district} · Created {selected.createdAt}</p>
              </SheetHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <StatusBadge status={selected.priority} />
                  <StatusBadge status={selected.status} />
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <div className="text-xs text-muted-foreground mb-1">Reason for Recommendation</div>
                  <p className="text-sm leading-relaxed">{selected.reason}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Recent Incidents</div>
                    <div className="text-xl font-bold">{selected.recentIncidents}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-3 w-3" />Time Window</div>
                    <div className="text-sm font-medium">{selected.suggestedTimeWindow}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Crime Types</div>
                  <div className="flex flex-wrap gap-1.5">{selected.crimeTypes.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                </div>
                {selected.assignedOfficer && (
                  <div className="p-3 rounded-lg bg-muted/40 border flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div><div className="text-xs text-muted-foreground">Assigned Officer</div><div className="text-sm font-medium">{selected.assignedOfficer}</div></div>
                    {selected.scheduledTime && <div className="ml-auto text-xs text-muted-foreground">{selected.scheduledTime}</div>}
                  </div>
                )}
                {relatedHotspot(selected) && (
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Related Hotspot</div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{relatedHotspot(selected)!.areaName}</span>
                      <StatusBadge status={relatedHotspot(selected)!.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{relatedHotspot(selected)!.incidentCount} incidents</p>
                  </div>
                )}
                {relatedFIRs(selected).length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Related FIRs</div>
                    <div className="space-y-1.5">{relatedFIRs(selected).map((f) => (
                      <div key={f.id} className="p-2 rounded-lg bg-muted/40 border flex items-center justify-between">
                        <div><div className="font-mono text-xs text-primary">{f.firNumber}</div><div className="text-xs text-muted-foreground">{f.crimeType}</div></div>
                        <StatusBadge status={f.status} />
                      </div>
                    ))}</div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {selected.status === "Pending" && (
                    <>
                      <Button size="sm" onClick={() => openAssign(selected)}>Accept & Assign</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(selected, "Under Review")}>Mark Under Review</Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleAction(selected, "Dismissed")}>Dismiss</Button>
                    </>
                  )}
                  {selected.status === "Under Review" && (
                    <>
                      <Button size="sm" onClick={() => openAssign(selected)}>Accept & Assign</Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleAction(selected, "Dismissed")}>Dismiss</Button>
                    </>
                  )}
                  {selected.status === "Accepted" && !selected.assignedOfficer && (
                    <Button size="sm" onClick={() => openAssign(selected)}>Assign Officer</Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Assign dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Patrol Task</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Assign Officer</Label>
              <Select value={assignOfficer} onValueChange={setAssignOfficer}>
                <SelectTrigger><SelectValue placeholder="Select officer..." /></SelectTrigger>
                <SelectContent>
                  {officers.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Scheduled Time (optional)</Label>
              <Input type="datetime-local" value={assignTime} onChange={(e) => setAssignTime(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAssign}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
