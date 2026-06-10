import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Phone, FileText, AlertCircle, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";

export default function Dashboard() {
  const { pcr, fir } = useStore();
  const nav = useNavigate();

  const totalPCR = pcr.length;
  const totalFIR = fir.length;
  const pending = pcr.filter((c) => c.status === "Pending").length + fir.filter((f) => f.status === "Open").length;
  const resolved = pcr.filter((c) => c.status === "Closed").length + fir.filter((f) => f.status === "Closed").length;

  const stats = [
    { label: "Total PCR Calls", value: totalPCR, icon: Phone, color: "text-info", bg: "bg-info/10", path: "/pcr", trend: "+12%" },
    { label: "Total FIRs", value: totalFIR, icon: FileText, color: "text-primary", bg: "bg-primary/10", path: "/fir", trend: "+5%" },
    { label: "Pending Cases", value: pending, icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", path: "/fir", trend: "-3%" },
    { label: "Resolved Cases", value: resolved, icon: CheckCircle2, color: "text-success", bg: "bg-success/10", path: "/reports", trend: "+18%" },
  ];

  const chartData = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({
    day: d,
    PCR: 8 + ((i * 5) % 12),
    FIR: 3 + ((i * 3) % 8),
  }));

  const crimeBreakdown = Object.entries(
    fir.reduce<Record<string, number>>((acc, f) => {
      const t = f.crimeType.split(" ")[0];
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {}),
  ).map(([name, count]) => ({ name, count }));

  const recent = [...pcr].slice(0, 5);

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, Inspector</h2>
          <p className="text-muted-foreground text-sm">Live overview of station activity · {new Date().toDateString()}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <button
              key={s.label}
              onClick={() => nav(s.path)}
              className="stat-card text-left group"
            >
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />{s.trend}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
              <ArrowRight className="absolute right-4 bottom-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Weekly Activity</h3>
                <p className="text-xs text-muted-foreground">PCR calls vs FIRs registered</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="PCR" stroke="hsl(var(--info))" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="FIR" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1">Crime Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-4">By IPC section</p>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={crimeBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent PCR Activity</h3>
            <button onClick={() => nav("/pcr")} className="text-xs text-primary font-medium hover:underline">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DD No.</th><th>Time</th><th>Caller</th><th>Type</th><th>Officer</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} onClick={() => nav("/pcr")}>
                    <td className="font-mono text-xs">{c.ddNumber}</td>
                    <td className="text-muted-foreground">{c.callTime}</td>
                    <td className="font-medium">{c.callerName}</td>
                    <td>{c.callType}</td>
                    <td className="text-muted-foreground">{c.officer}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
