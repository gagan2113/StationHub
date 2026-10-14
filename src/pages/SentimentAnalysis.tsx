import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Brain, Phone, Mail, Search, AlertTriangle, TrendingUp, Info } from "lucide-react";
import type { PCRCall, EmailRecord, SentimentType, UrgencyLevel } from "@/store/PoliceStore";

type CommRecord = { id: string; type: "Call" | "Email"; subject: string; sender: string; time: string; location?: string; sentiment: SentimentType; urgency: UrgencyLevel; confidence?: number; summary: string; keywords: string[]; entities: { type: string; value: string }[]; linkedFIR?: string; actions?: string[]; originalData: PCRCall | EmailRecord };

const chartStyle = { contentStyle: { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(200,215,240,0.70)", borderRadius: 10, fontSize: 12, color: "hsl(222 47% 11%)" }, cursor: { fill: "rgba(0,0,0,0.04)" } };

const SENTIMENT_COLORS: Record<string, string> = {
  Negative: "hsl(var(--destructive))",
  Neutral: "hsl(var(--muted-foreground))",
  Mixed: "hsl(var(--warning))",
  Positive: "hsl(var(--success))",
};

export default function SentimentAnalysis() {
  const { pcr, emails } = useStore();
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<CommRecord | null>(null);

  const allRecords: CommRecord[] = [
    ...pcr.filter((c) => c.sentiment).map((c) => ({
      id: c.id, type: "Call" as const, subject: c.callType, sender: c.callerName, time: c.callTime,
      location: c.location, sentiment: c.sentiment!, urgency: c.urgency ?? "Medium",
      summary: c.aiSummary ?? "No summary available.", keywords: c.keywords ?? [],
      entities: c.entities ?? [], linkedFIR: c.convertedToFIR, actions: c.followUpActions,
      originalData: c,
    })),
    ...emails.map((e) => ({
      id: e.id, type: "Email" as const, subject: e.subject, sender: e.sender, time: e.receivedAt,
      location: e.location, sentiment: e.sentiment, urgency: e.priority, confidence: e.confidence,
      summary: e.aiSummary, keywords: e.keywords, entities: e.entities, linkedFIR: e.linkedFIR,
      actions: e.suggestedActions, originalData: e,
    })),
  ].sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return order[a.urgency] - order[b.urgency];
  });

  const filtered = allRecords.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.subject.toLowerCase().includes(q) || r.sender.toLowerCase().includes(q) || (r.location ?? "").toLowerCase().includes(q);
    const matchSentiment = sentimentFilter === "all" || r.sentiment === sentimentFilter;
    const matchUrgency = urgencyFilter === "all" || r.urgency === urgencyFilter;
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchSentiment && matchUrgency && matchType;
  });

  const sentimentCounts = (["Negative", "Mixed", "Neutral", "Positive"] as SentimentType[]).map((s) => ({
    name: s, value: allRecords.filter((r) => r.sentiment === s).length,
  }));

  const urgencyCounts = (["Critical", "High", "Medium", "Low"] as UrgencyLevel[]).map((u) => ({
    name: u,
    Calls: pcr.filter((c) => c.urgency === u).length,
    Emails: emails.filter((e) => e.priority === u).length,
  }));

  const locationSentiment = Object.entries(
    allRecords.reduce<Record<string, { Negative: number; Mixed: number; Neutral: number; Positive: number }>>((acc, r) => {
      const loc = r.location?.split(",")[0] ?? "Unknown";
      if (!acc[loc]) acc[loc] = { Negative: 0, Mixed: 0, Neutral: 0, Positive: 0 };
      acc[loc][r.sentiment]++;
      return acc;
    }, {})
  ).map(([area, counts]) => ({ area, ...counts })).slice(0, 6);

  const negCount = allRecords.filter((r) => r.sentiment === "Negative").length;
  const critCount = allRecords.filter((r) => r.urgency === "Critical").length;

  return (
    <AppLayout title="Sentiment Analysis">
      <div className="space-y-5">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-info/5 border border-info/20 text-sm text-muted-foreground">
          <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-foreground">AI Sentiment Analysis. </span>
            Results are generated by AI and should not be used as evidence or to label individuals. Human review is required before operational use.
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Records Analysed", value: allRecords.length, icon: Brain, color: "text-primary" },
            { label: "Negative Sentiment", value: negCount, icon: AlertTriangle, color: "text-destructive" },
            { label: "Critical Urgency", value: critCount, icon: AlertTriangle, color: "text-destructive" },
            { label: "Unique Locations", value: new Set(allRecords.map((r) => r.location?.split(",")[0]).filter(Boolean)).size, icon: TrendingUp, color: "text-info" },
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Sentiment Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">All calls and emails</p>
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={sentimentCounts} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                    {sentimentCounts.map((entry) => (
                      <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {sentimentCounts.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: SENTIMENT_COLORS[d.name] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Urgency by Channel</h3>
            <p className="text-xs text-muted-foreground mb-4">Calls vs Emails breakdown</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={urgencyCounts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...chartStyle} />
                  <Legend />
                  <Bar dataKey="Calls" fill="hsl(var(--info))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Emails" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Sentiment by Location</h3>
            <p className="text-xs text-muted-foreground mb-4">Top 6 reported areas</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={locationSentiment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis dataKey="area" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={70} />
                  <Tooltip {...chartStyle} />
                  <Bar dataKey="Negative" stackId="a" fill="hsl(var(--destructive))" />
                  <Bar dataKey="Mixed" stackId="a" fill="hsl(var(--warning))" />
                  <Bar dataKey="Neutral" stackId="a" fill="hsl(var(--muted-foreground))" />
                  <Bar dataKey="Positive" stackId="a" fill="hsl(var(--success))" radius={[0, 3, 3, 0]} />
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
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records..." className="pl-8 h-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Call">Calls</SelectItem>
                <SelectItem value="Email">Emails</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Sentiment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="Negative">Negative</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Positive">Positive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} records</span>
          </div>
        </Card>

        {/* Records list */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th><th>Subject / Call Type</th><th>From</th><th>Location</th><th>Time</th><th>Sentiment</th><th>Confidence</th><th>Urgency</th><th>Linked FIR</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => setSelected(r)} className="cursor-pointer">
                    <td>
                      <Badge variant="outline" className="gap-1 text-xs">
                        {r.type === "Call" ? <Phone className="h-3 w-3" /> : <Mail className="h-3 w-3" />}
                        {r.type}
                      </Badge>
                    </td>
                    <td className="font-medium text-sm max-w-[180px] truncate">{r.subject}</td>
                    <td className="text-sm">{r.sender}</td>
                    <td className="text-xs text-muted-foreground max-w-[140px] truncate">{r.location ?? "—"}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{r.time}</td>
                    <td><StatusBadge status={r.sentiment} /></td>
                    <td className="text-xs">{r.confidence ? `${(r.confidence * 100).toFixed(0)}%` : "—"}</td>
                    <td><StatusBadge status={r.urgency} /></td>
                    <td className="font-mono text-xs text-primary">{r.linkedFIR ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center">
              <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-muted-foreground text-sm">No records match current filters.</p>
            </div>
          )}
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-2">
                  {selected.type === "Call" ? <Phone className="h-4 w-4 text-info" /> : <Mail className="h-4 w-4 text-primary" />}
                  <SheetTitle className="text-base leading-tight">{selected.subject}</SheetTitle>
                </div>
              </SheetHeader>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                  AI sentiment analysis. Human review required before operational decision-making.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/40 border"><div className="text-xs text-muted-foreground mb-1">Sentiment</div><StatusBadge status={selected.sentiment} /></div>
                  <div className="p-3 rounded-lg bg-muted/40 border"><div className="text-xs text-muted-foreground mb-1">Urgency</div><StatusBadge status={selected.urgency} /></div>
                  {selected.confidence && <div className="p-3 rounded-lg bg-muted/40 border"><div className="text-xs text-muted-foreground mb-1">Confidence</div><span className="font-semibold">{(selected.confidence * 100).toFixed(0)}%</span></div>}
                  {selected.location && <div className="p-3 rounded-lg bg-muted/40 border"><div className="text-xs text-muted-foreground mb-1">Location</div><span className="text-sm">{selected.location}</span></div>}
                </div>
                <div className="p-4 rounded-lg bg-muted/40 border">
                  <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Brain className="h-3 w-3" />AI Summary</div>
                  <p className="text-sm leading-relaxed">{selected.summary}</p>
                </div>
                {selected.entities.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Extracted Entities</div>
                    <div className="flex flex-wrap gap-2">{selected.entities.map((e, i) => <Badge key={i} variant="outline" className="text-xs">{e.type}: {e.value}</Badge>)}</div>
                  </div>
                )}
                {selected.keywords.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Key Topics</div>
                    <div className="flex flex-wrap gap-1.5">{selected.keywords.map((k) => <span key={k} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{k}</span>)}</div>
                  </div>
                )}
                {selected.actions && selected.actions.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Suggested Actions</div>
                    <ul className="space-y-1.5">{selected.actions.map((a, i) => <li key={i} className="text-sm flex items-start gap-2"><span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">{i + 1}</span>{a}</li>)}</ul>
                  </div>
                )}
                {selected.linkedFIR && (
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Linked FIR</div>
                    <span className="font-mono text-sm text-primary">{selected.linkedFIR}</span>
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
