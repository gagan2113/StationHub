import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  FileText, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Phone, Mail, MapPin, Package, AlertCircle, ArrowRight, Flame, Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const COLORS = ["hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--primary))"];

const chartStyle = {
  contentStyle: { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(200,215,240,0.70)", borderRadius: 10, fontSize: 12, color: "hsl(222 47% 11%)" },
  labelStyle: { color: "hsl(220 13% 46%)" },
  cursor: { fill: "rgba(0,0,0,0.04)" },
};

export default function Dashboard() {
  const { pcr, fir, emails, hotspots, recoveredItems, crimePatterns, patrolRecommendations } = useStore();
  const nav = useNavigate();

  const totalFIR = fir.length;
  const activeCases = fir.filter((f) => f.status === "Open" || f.status === "Under Investigation").length;
  const todayFIR = fir.filter((f) => f.date === "2025-04-26").length;
  const closedFIR = fir.filter((f) => f.status === "Closed" || f.status === "Charge-sheeted").length;
  const totalComms = pcr.length + emails.length;
  const hotspotCount = hotspots.filter((h) => h.severity === "High" || h.severity === "Critical").length;
  const recoveredValue = recoveredItems.reduce((s, i) => s + i.estimatedValue, 0);
  const highPriority = fir.filter((f) => f.severity === "Critical" || f.severity === "High").length;
  const unreadComms = emails.filter((e) => e.status === "Unread").length + pcr.filter((p) => p.status === "Pending").length;
  const activePatterns = crimePatterns.filter((c) => c.status === "Active").length;
  const pendingPatrol = patrolRecommendations.filter((r) => r.status === "Pending").length;

  const kpis = [
    { label: "Total FIRs Registered", value: totalFIR, icon: FileText, color: "text-primary", bg: "bg-primary/10", path: "/fir", trend: "+5", trendUp: true, sub: "All time" },
    { label: "Active Investigations", value: activeCases, icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", path: "/fir", trend: "+2", trendUp: true, sub: "Open + Under Investigation" },
    { label: "Cases Reported Today", value: todayFIR, icon: Shield, color: "text-info", bg: "bg-info/10", path: "/fir", trend: "0", trendUp: false, sub: "Apr 26, 2025" },
    { label: "Cases Resolved", value: closedFIR, icon: CheckCircle2, color: "text-success", bg: "bg-success/10", path: "/fir", trend: "+3", trendUp: true, sub: "Closed + Charge-sheeted" },
    { label: "Communications Analysed", value: totalComms, icon: Phone, color: "text-info", bg: "bg-info/10", path: "/communications", trend: `+${unreadComms} new`, trendUp: false, sub: "Calls + Emails" },
    { label: "Active Hotspot Areas", value: hotspotCount, icon: Flame, color: "text-destructive", bg: "bg-destructive/10", path: "/hotspots", trend: "+1 this week", trendUp: false, sub: "High + Critical severity" },
    { label: "Items Recovered (₹)", value: `${(recoveredValue / 100000).toFixed(1)}L`, icon: Package, color: "text-success", bg: "bg-success/10", path: "/recovered", trend: "+2 today", trendUp: true, sub: "Total estimated value" },
    { label: "High Priority Cases", value: highPriority, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", path: "/fir", trend: "Needs attention", trendUp: false, sub: "Critical + High severity" },
  ];

  const trendData = ["Apr 19", "Apr 20", "Apr 21", "Apr 22", "Apr 23", "Apr 24", "Apr 25", "Apr 26"].map((d, i) => ({
    date: d,
    FIRs: [2, 4, 3, 2, 3, 2, 1, 2][i],
    Calls: [8, 12, 10, 9, 11, 8, 9, 7][i],
    Emails: [1, 2, 1, 2, 1, 1, 2, 1][i],
  }));

  const crimeCategoryData = Object.entries(
    fir.reduce<Record<string, number>>((acc, f) => {
      const t = f.crimeType.split(" ")[0];
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  const statusData = [
    { name: "Open", value: fir.filter((f) => f.status === "Open").length },
    { name: "Under Investigation", value: fir.filter((f) => f.status === "Under Investigation").length },
    { name: "Charge-sheeted", value: fir.filter((f) => f.status === "Charge-sheeted").length },
    { name: "Closed", value: fir.filter((f) => f.status === "Closed").length },
  ].filter((d) => d.value > 0);

  const hotspotData = hotspots.map((h) => ({ name: h.areaName.split(" ").slice(0, 2).join(" "), incidents: h.incidentCount, severity: h.severity })).sort((a, b) => b.incidents - a.incidents);

  const recentFIR = [...fir].slice(0, 5);

  return (
    <AppLayout title="Intelligence Overview Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Crime Intelligence Overview</h2>
            <p className="text-muted-foreground text-sm mt-1">
              National Crime Intelligence Agency · {new Date("2025-04-26").toDateString()} · Delhi Region
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activePatterns > 0 && (
              <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 gap-1.5">
                <AlertTriangle className="h-3 w-3" />
                {activePatterns} Active Crime Patterns
              </Badge>
            )}
            {pendingPatrol > 0 && (
              <Badge variant="outline" className="bg-warning/15 text-warning border-warning/40 gap-1.5">
                <AlertCircle className="h-3 w-3" />
                {pendingPatrol} Patrol Alerts Pending
              </Badge>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((s) => (
            <button key={s.label} onClick={() => nav(s.path)} className="stat-card text-left group">
              <div className="flex items-start justify-between">
                <div className={`h-9 w-9 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                  <s.icon className="h-4.5 w-4.5" />
                </div>
                <span className={`text-xs flex items-center gap-1 ${s.trendUp ? "text-success" : "text-muted-foreground"}`}>
                  {s.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.trend}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm font-medium text-foreground mt-0.5">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
              </div>
              <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5">
            <div className="mb-4">
              <h3 className="font-semibold">Incident Trend – Last 8 Days</h3>
              <p className="text-xs text-muted-foreground">FIRs registered, calls and emails received</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorFIR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...chartStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="FIRs" stroke="hsl(var(--primary))" fill="url(#colorFIR)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Calls" stroke="hsl(var(--info))" fill="url(#colorCalls)" strokeWidth={2} />
                  <Line type="monotone" dataKey="Emails" stroke="hsl(var(--warning))" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1">Case Status Distribution</h3>
            <p className="text-xs text-muted-foreground mb-4">Current status of all FIRs</p>
            <div className="h-40">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {statusData.map((d, idx) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-semibold mb-1">Crime Category Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">FIRs by primary offence type</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={crimeCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={60} />
                  <Tooltip {...chartStyle} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1">Hotspot Incident Counts</h3>
            <p className="text-xs text-muted-foreground mb-4">Incidents per high-risk area</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={hotspotData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip {...chartStyle} formatter={(val, _name, props) => [val, `Incidents (${props.payload?.severity})`]} />
                  <Bar dataKey="incidents" radius={[6, 6, 0, 0]}>
                    {hotspotData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.severity === "Critical" ? "hsl(var(--destructive))" : entry.severity === "High" ? "hsl(var(--warning))" : "hsl(var(--info))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent FIRs */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Recent FIR Registrations</h3>
              <p className="text-xs text-muted-foreground">Latest cases requiring attention</p>
            </div>
            <button onClick={() => nav("/fir")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>FIR No.</th><th>Date</th><th>Crime Type</th><th>Station</th><th>IO</th><th>Severity</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentFIR.map((f) => (
                  <tr key={f.id} onClick={() => nav("/fir")} className="cursor-pointer">
                    <td className="font-mono text-xs">{f.firNumber}</td>
                    <td className="text-muted-foreground text-xs">{f.date}</td>
                    <td className="font-medium text-sm">{f.crimeType}</td>
                    <td className="text-muted-foreground text-sm">{f.station}</td>
                    <td className="text-sm">{f.io}</td>
                    <td><StatusBadge status={f.severity ?? "Medium"} /></td>
                    <td><StatusBadge status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "View Hotspot Map", desc: "Geographic crime intelligence", path: "/hotspots", icon: MapPin, color: "text-destructive", glow: "rgba(239,68,68,0.12)" },
            { label: "Active Patterns", desc: `${activePatterns} patterns detected`, path: "/patterns", icon: AlertTriangle, color: "text-warning", glow: "rgba(245,158,11,0.12)" },
            { label: "Patrol Planning", desc: `${pendingPatrol} recommendations pending`, path: "/patrol", icon: Shield, color: "text-info", glow: "rgba(14,165,233,0.12)" },
            { label: "Daily Report", desc: "Generate intelligence summary", path: "/daily-report", icon: FileText, color: "text-primary", glow: "rgba(59,130,246,0.12)" },
          ].map((l) => (
            <button
              key={l.label}
              onClick={() => nav(l.path)}
              className="text-left p-4 rounded-xl transition-all duration-200 group hover:-translate-y-0.5"
              style={{
                background: "var(--glass-bg)",
                backdropFilter: "blur(var(--glass-blur))",
                WebkitBackdropFilter: "blur(var(--glass-blur))",
                border: "1px solid var(--glass-border)",
                boxShadow: "var(--glass-shadow)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `var(--glass-shadow-lg), 0 0 24px ${l.glow}`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--glass-shadow)"; e.currentTarget.style.transform = ""; }}
            >
              <l.icon className={`h-5 w-5 ${l.color} mb-2`} />
              <div className="text-sm font-semibold">{l.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{l.desc}</div>
            </button>
          ))}
        </div>

        {/* Emails needing attention */}
        {emails.filter((e) => e.status === "Unread").length > 0 && (
          <div
            className="p-5 rounded-xl"
            style={{
              background: "rgba(217,119,6,0.07)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(217,119,6,0.22)",
              boxShadow: "0 8px 32px rgba(100,130,200,0.12), inset 0 1px 0 rgba(255,255,255,0.80)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-warning" />
                <h3 className="font-semibold text-sm">Unread Emails Require Attention</h3>
              </div>
              <button onClick={() => nav("/communications")} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {emails.filter((e) => e.status === "Unread").map((e) => (
                <div
                  key={e.id}
                  onClick={() => nav("/communications")}
                  className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                  }}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = "rgba(255,255,255,0.70)")}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = "var(--glass-bg)")}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{e.subject}</span>
                      <StatusBadge status={e.priority} className="shrink-0" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{e.bodyPreview}</div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{e.receivedAt.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
