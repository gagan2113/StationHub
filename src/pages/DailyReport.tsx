import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileBarChart2, Download, RefreshCw, Printer, Calendar, Shield, AlertTriangle, CheckCircle2, Phone, Mail, Flame, Package, Navigation, GitBranch } from "lucide-react";

const REPORT_DATES = ["2025-04-26", "2025-04-25", "2025-04-24", "2025-04-23", "2025-04-22"];

export default function DailyReport() {
  const { fir, pcr, emails, hotspots, crimePatterns, patrolRecommendations, recoveredItems } = useStore();
  const [selectedDate, setSelectedDate] = useState("2025-04-26");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(true);

  const regenerate = () => {
    setIsGenerating(true);
    setGenerated(false);
    setTimeout(() => { setIsGenerating(false); setGenerated(true); toast.success("Daily Intelligence Report generated"); }, 1200);
  };

  // Compute date-specific or overall stats
  const dateFIRs = fir.filter((f) => f.date === selectedDate);
  const activeInvestigations = fir.filter((f) => f.status === "Open" || f.status === "Under Investigation");
  const criticalCases = fir.filter((f) => f.severity === "Critical" || f.severity === "High");
  const negativeComms = [...pcr.filter((c) => c.sentiment === "Negative"), ...emails.filter((e) => e.sentiment === "Negative")];
  const criticalHotspots = hotspots.filter((h) => h.severity === "Critical" || h.severity === "High");
  const activePatterns = crimePatterns.filter((p) => p.status === "Active");
  const pendingPatrol = patrolRecommendations.filter((r) => r.status === "Pending" && (r.priority === "Critical" || r.priority === "High"));
  const todayRecovered = recoveredItems.filter((r) => r.recoveryDate === selectedDate);
  const totalRecoveredValue = recoveredItems.reduce((s, r) => s + r.estimatedValue, 0);

  const topCrimeAreas = hotspots.sort((a, b) => b.incidentCount - a.incidentCount).slice(0, 3);

  const crimeByCategory = Object.entries(
    fir.reduce<Record<string, number>>((acc, f) => {
      const t = f.crimeType.split(" ")[0];
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const content = `NCIA Daily Intelligence Report\nDate: ${selectedDate}\n\nGenerated: ${new Date().toISOString()}\n\n== NEW FIRs (${dateFIRs.length}) ==\n${dateFIRs.map((f) => `${f.firNumber} | ${f.crimeType} | ${f.station} | ${f.status}`).join("\n")}\n\n== ACTIVE INVESTIGATIONS (${activeInvestigations.length}) ==\n${activeInvestigations.map((f) => `${f.firNumber} | ${f.crimeType} | IO: ${f.io}`).join("\n")}\n\n== CRIME HOTSPOTS (${criticalHotspots.length} High/Critical) ==\n${criticalHotspots.map((h) => `${h.areaName} | Severity: ${h.severity} | ${h.incidentCount} incidents | Trend: ${h.trend}`).join("\n")}\n\n== ACTIVE CRIME PATTERNS (${activePatterns.length}) ==\n${activePatterns.map((p) => `${p.title} | ${p.area} | ${p.incidentCount} incidents | ${p.frequency}`).join("\n")}\n\n== PATROL RECOMMENDATIONS (${pendingPatrol.length} pending critical/high) ==\n${pendingPatrol.map((r) => `${r.area} | Priority: ${r.priority} | ${r.suggestedTimeWindow}`).join("\n")}\n\n== RECOVERED ITEMS TODAY (${todayRecovered.length}) ==\n${todayRecovered.map((i) => `${i.itemId} | ${i.name} | ₹${i.estimatedValue.toLocaleString()} | FIR: ${i.linkedCase}`).join("\n")}\n\nNOTE: This report is generated from NCIA Crime Intelligence Platform data.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NCIA-DailyReport-${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported as text file");
  };

  return (
    <AppLayout title="Daily Intelligence Report">
      <div className="space-y-5">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Select value={selectedDate} onValueChange={(d) => { setSelectedDate(d); setGenerated(false); }}>
              <SelectTrigger className="w-44 h-9">
                <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_DATES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={regenerate} disabled={isGenerating} className="gap-2">
              <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </div>
          {generated && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} className="gap-2"><Printer className="h-3.5 w-3.5" />Print</Button>
              <Button size="sm" variant="outline" onClick={handleExport} className="gap-2"><Download className="h-3.5 w-3.5" />Export</Button>
            </div>
          )}
        </div>

        {!generated && !isGenerating && (
          <Card className="p-10 text-center">
            <FileBarChart2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground mb-3">Click "Generate Report" to create the intelligence summary for {selectedDate}</p>
            <Button onClick={regenerate}>Generate Report</Button>
          </Card>
        )}

        {isGenerating && (
          <Card className="p-10 text-center">
            <RefreshCw className="h-10 w-10 text-primary mx-auto mb-3 animate-spin" />
            <p className="text-muted-foreground">Compiling intelligence summary from available records...</p>
          </Card>
        )}

        {generated && (
          <div className="space-y-4 print:space-y-3">
            {/* Report header */}
            <Card className="p-5" style={{ borderColor: "rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.07)" }}>
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold">NCIA Daily Intelligence Summary</h2>
                  </div>
                  <div className="text-sm text-muted-foreground">Reporting Date: <strong>{selectedDate}</strong> · Delhi Region · Generated {new Date().toLocaleTimeString()}</div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div>Analyst: Insp. Meera Joshi</div>
                  <div>Station: NCIA Regional HQ</div>
                </div>
              </div>
            </Card>

            {/* KPI summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "New FIRs Today", value: dateFIRs.length, icon: FileBarChart2, color: "text-primary" },
                { label: "Active Investigations", value: activeInvestigations.length, icon: AlertTriangle, color: "text-warning" },
                { label: "High Priority Cases", value: criticalCases.length, icon: AlertTriangle, color: "text-destructive" },
                { label: "Communications Analysed", value: pcr.length + emails.length, icon: Phone, color: "text-info" },
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

            {/* Section 1: New FIRs */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><FileBarChart2 className="h-4 w-4 text-primary" />1. New FIRs Registered — {selectedDate}</h3>
              {dateFIRs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead><tr><th>FIR No.</th><th>Crime Type</th><th>Station</th><th>Complainant</th><th>IO</th><th>Status</th></tr></thead>
                    <tbody>
                      {dateFIRs.map((f) => (
                        <tr key={f.id}>
                          <td className="font-mono text-xs text-primary">{f.firNumber}</td>
                          <td className="text-sm">{f.crimeType}</td>
                          <td className="text-xs text-muted-foreground">{f.station}</td>
                          <td className="text-sm">{f.complainant}</td>
                          <td className="text-xs text-muted-foreground">{f.io}</td>
                          <td><StatusBadge status={f.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-muted-foreground">No FIRs registered on {selectedDate}.</p>}
            </Card>

            {/* Section 2: Crime categories */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><AlertTriangle className="h-4 w-4 text-warning" />2. Major Crime Categories (All Active)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {crimeByCategory.map(([cat, count]) => (
                  <div key={cat} className="p-3 rounded-lg bg-muted/40 border text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground mt-1">{cat}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Section 3: Hotspots */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Flame className="h-4 w-4 text-destructive" />3. Active Crime Hotspots</h3>
              <div className="space-y-2">
                {topCrimeAreas.map((h, i) => (
                  <div key={h.id} className="p-3 rounded-lg bg-muted/40 border flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      <div>
                        <div className="text-sm font-medium">{h.areaName}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{h.district} · {h.incidentCount} incidents · Trend: {h.trend}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{h.description.slice(0, 100)}...</div>
                      </div>
                    </div>
                    <StatusBadge status={h.severity} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Section 4: Crime patterns */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><GitBranch className="h-4 w-4 text-primary" />4. Emerging Crime Patterns ({activePatterns.length} Active)</h3>
              {activePatterns.length > 0 ? (
                <div className="space-y-2">
                  {activePatterns.map((p) => (
                    <div key={p.id} className="p-3 rounded-lg bg-muted/40 border">
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <span className="text-sm font-medium">{p.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{p.incidentCount} incidents</Badge>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.area} · {p.frequency} · {p.timeRange}</p>
                      <p className="text-xs text-muted-foreground mt-1 italic">{p.patternNote}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No active crime patterns detected.</p>}
            </Card>

            {/* Section 5: Communications */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Phone className="h-4 w-4 text-info" />5. Calls & Email Intelligence Highlights</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-muted/40 border text-center"><div className="text-xl font-bold">{pcr.length}</div><div className="text-xs text-muted-foreground">Total Calls</div></div>
                <div className="p-3 rounded-lg bg-muted/40 border text-center"><div className="text-xl font-bold">{emails.length}</div><div className="text-xs text-muted-foreground">Total Emails</div></div>
                <div className="p-3 rounded-lg bg-muted/40 border text-center"><div className="text-xl font-bold text-destructive">{negativeComms.length}</div><div className="text-xs text-muted-foreground">Negative Sentiment</div></div>
              </div>
              {emails.filter((e) => e.priority === "Critical" || e.priority === "High").length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">High-priority email concerns:</div>
                  {emails.filter((e) => e.priority === "Critical" || e.priority === "High").map((e) => (
                    <div key={e.id} className="p-2 rounded bg-muted/40 border mb-1 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">{e.subject}</span>
                      <StatusBadge status={e.priority} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Section 6: Patrol */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Navigation className="h-4 w-4 text-primary" />6. Patrol Recommendations</h3>
              <div className="space-y-2">
                {patrolRecommendations.filter((r) => r.priority === "Critical" || r.priority === "High").map((r) => (
                  <div key={r.id} className="p-3 rounded-lg bg-muted/40 border flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{r.area}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{r.suggestedTimeWindow} · {r.crimeTypes.join(", ")}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={r.priority} />
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Section 7: Recovered items */}
            <Card className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3"><Package className="h-4 w-4 text-success" />7. Recovered Items</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-muted/40 border text-center"><div className="text-xl font-bold text-success">{recoveredItems.length}</div><div className="text-xs text-muted-foreground">Total Items</div></div>
                <div className="p-3 rounded-lg bg-muted/40 border text-center"><div className="text-xl font-bold text-success">₹{(totalRecoveredValue / 100000).toFixed(1)}L</div><div className="text-xs text-muted-foreground">Total Value</div></div>
              </div>
              {todayRecovered.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Items recovered on {selectedDate}:</div>
                  {todayRecovered.map((i) => (
                    <div key={i.id} className="p-2 rounded bg-muted/40 border mb-1 flex items-center justify-between gap-2">
                      <div><div className="text-xs font-medium">{i.name}</div><div className="text-xs text-muted-foreground">{i.linkedCase}</div></div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">₹{i.estimatedValue.toLocaleString()}</span>
                        <StatusBadge status={i.recoveryStatus} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Closing note */}
            <Card className="p-4 bg-muted/30 border-dashed">
              <p className="text-xs text-muted-foreground text-center">
                End of Daily Intelligence Summary · {selectedDate} · NCIA Regional HQ, Delhi
              </p>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
