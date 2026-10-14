import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStore, FIRStatus } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Search, UserPlus, AlertTriangle, Filter, ChevronRight, Eye, Package } from "lucide-react";
import { stations, officers } from "@/store/PoliceStore";

export default function FIR() {
  const { fir, accused, recoveredItems, updateFIRStatus, linkAccusedToFIR } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [stationFilter, setStationFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [linkAccusedId, setLinkAccusedId] = useState<string>("");

  const filtered = fir.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.firNumber.toLowerCase().includes(q) || f.complainant.toLowerCase().includes(q) || f.crimeType.toLowerCase().includes(q) || f.station.toLowerCase().includes(q) || f.io.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    const matchSeverity = severityFilter === "all" || f.severity === severityFilter;
    const matchStation = stationFilter === "all" || f.station === stationFilter;
    return matchSearch && matchStatus && matchSeverity && matchStation;
  });

  const current = fir.find((f) => f.id === openId);
  const currentRecoveredItems = current ? recoveredItems.filter((r) => current.recoveredItemIds?.includes(r.id) || r.linkedFIR === current.id) : [];

  const summary = {
    total: fir.length,
    open: fir.filter((f) => f.status === "Open").length,
    active: fir.filter((f) => f.status === "Under Investigation").length,
    critical: fir.filter((f) => f.severity === "Critical" || f.severity === "High").length,
  };

  return (
    <AppLayout title="FIR & Case Management">
      <div className="space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold">First Information Reports</h2>
            <p className="text-sm text-muted-foreground">{fir.length} total cases · {summary.active} under investigation</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total FIRs", value: summary.total, color: "text-primary" },
            { label: "Open Cases", value: summary.open, color: "text-warning" },
            { label: "Under Investigation", value: summary.active, color: "text-info" },
            { label: "Critical / High Priority", value: summary.critical, color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label} className="p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FIR no., complainant, crime type..." className="pl-8 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {(["Open", "Under Investigation", "Charge-sheeted", "Closed"] as FIRStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Station" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} records</span>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>FIR No.</th><th>Date</th><th>Crime Type</th><th>Station</th><th>Complainant</th><th>IO</th><th>Severity</th><th>Status</th><th>Accused</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} onClick={() => setOpenId(f.id)} className="cursor-pointer">
                    <td className="font-mono text-xs font-semibold text-primary">{f.firNumber}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{f.date}</td>
                    <td className="font-medium text-sm max-w-[180px] truncate">{f.crimeType}</td>
                    <td className="text-sm">{f.station}</td>
                    <td className="text-sm">{f.complainant}</td>
                    <td className="text-xs text-muted-foreground">{f.io}</td>
                    <td><StatusBadge status={f.severity ?? "Medium"} /></td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {f.accusedIds.length}
                      </span>
                    </td>
                    <td><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center"><FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" /><p className="text-muted-foreground text-sm">No FIRs match the current filters.</p></div>
          )}
        </Card>
      </div>

      {/* Case detail sheet */}
      <Sheet open={!!openId} onOpenChange={(o) => { if (!o) { setOpenId(null); setLinkAccusedId(""); } }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {current && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <SheetTitle className="font-mono text-base">{current.firNumber}</SheetTitle>
                </div>
                <p className="text-xs text-muted-foreground">{current.station} · Registered {current.date}</p>
              </SheetHeader>
              <Tabs defaultValue="overview">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="evidence" className="flex-1">Evidence</TabsTrigger>
                  <TabsTrigger value="accused" className="flex-1">Accused</TabsTrigger>
                  <TabsTrigger value="recovered" className="flex-1">Recovered</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <StatusBadge status={current.status} />
                    <StatusBadge status={current.severity ?? "Medium"} />
                    {current.sourcePCR && <Badge variant="outline" className="text-xs">From PCR</Badge>}
                    {current.sourceEFIR && <Badge variant="outline" className="text-xs">From e-FIR</Badge>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Crime Type", value: current.crimeType },
                      { label: "Investigating Officer", value: current.io },
                      { label: "Complainant", value: current.complainant },
                      { label: "Source", value: current.sourcePCR ? "PCR Call" : current.sourceEFIR ? "e-FIR" : "Direct Registration" },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 rounded-lg bg-muted/40 border">
                        <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                        <div className="text-sm font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Case Description</div>
                    <p className="text-sm leading-relaxed">{current.description}</p>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Update Investigation Status</label>
                      <Select value={current.status} onValueChange={(v) => { updateFIRStatus(current.id, v as FIRStatus); toast.success(`Status updated to ${v}`); }}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(["Open", "Under Investigation", "Charge-sheeted", "Closed"] as FIRStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Link Accused</label>
                      <div className="flex gap-2">
                        <Select value={linkAccusedId} onValueChange={setLinkAccusedId}>
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Select accused..." /></SelectTrigger>
                          <SelectContent>
                            {accused.filter((a) => !current.accusedIds.includes(a.id)).map((a) => (
                              <SelectItem key={a.id} value={a.id}>{a.name} ({a.arrestStatus})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="icon" disabled={!linkAccusedId} onClick={() => { linkAccusedToFIR(current.id, linkAccusedId); toast.success("Accused linked"); setLinkAccusedId(""); }}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="evidence" className="space-y-3">
                  {current.evidence && current.evidence.length > 0 ? (
                    <div className="space-y-2">
                      {current.evidence.map((e, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                          <span className="text-sm">{e}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No evidence items recorded for this case.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="accused" className="space-y-3">
                  {current.accusedIds.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">No accused linked to this FIR yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {current.accusedIds.map((id) => {
                        const a = accused.find((x) => x.id === id);
                        if (!a) return null;
                        return (
                          <div key={id} className="p-3 rounded-lg bg-muted/40 border">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-medium text-sm">{a.name}</span>
                              <StatusBadge status={a.arrestStatus} />
                            </div>
                            <div className="text-xs text-muted-foreground">{a.age}y · {a.gender} · {a.address}</div>
                            {a.history.length > 0 && <div className="mt-1.5 text-xs text-warning">{a.history.join(", ")}</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recovered" className="space-y-3">
                  {currentRecoveredItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No recovered items linked to this case.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentRecoveredItems.map((item) => (
                        <div key={item.id} className="p-3 rounded-lg bg-muted/40 border">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-medium text-sm">{item.name}</span>
                              <span className="text-xs text-muted-foreground ml-2 font-mono">{item.itemId}</span>
                            </div>
                            <StatusBadge status={item.recoveryStatus} />
                          </div>
                          <div className="text-xs text-muted-foreground">{item.category} · {item.recoveryDate} · {item.recoveryLocation}</div>
                          {item.estimatedValue > 0 && <div className="text-xs text-success mt-0.5">₹{item.estimatedValue.toLocaleString()}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
