import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileBarChart } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useMemo, useState } from "react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

export default function Reports() {
  const { pcr, fir } = useStore();
  const [station, setStation] = useState("all");
  const [caseType, setCaseType] = useState("all");

  const stations = Array.from(new Set(fir.map((f) => f.station)));
  const types = Array.from(new Set(fir.map((f) => f.crimeType)));

  const filteredFIR = useMemo(() => fir.filter((f) =>
    (station === "all" || f.station === station) && (caseType === "all" || f.crimeType === caseType),
  ), [fir, station, caseType]);

  const officerWorkload = useMemo(() => {
    const map: Record<string, number> = {};
    [...pcr, ...fir.map((f) => ({ officer: f.io }))].forEach((x: any) => {
      map[x.officer] = (map[x.officer] || 0) + 1;
    });
    return Object.entries(map).map(([name, cases]) => ({ name: name.replace(/^[A-Z]+\.\s/, ""), cases }));
  }, [pcr, fir]);

  const firByStation = stations.map((s) => ({ name: s, count: fir.filter((f) => f.station === s).length }));
  const pcrByStatus = ["Pending","In Progress","Closed"].map((s) => ({ name: s, value: pcr.filter((c) => c.status === s).length }));

  return (
    <AppLayout title="Reports">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex items-center gap-2 mr-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              <div>
                <h2 className="font-semibold text-sm">Report Filters</h2>
                <p className="text-xs text-muted-foreground">Refine the reports below</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 min-w-[300px]">
              <div>
                <Label className="text-xs">Date From</Label>
                <Input type="date" defaultValue="2025-04-01" className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Date To</Label>
                <Input type="date" defaultValue="2025-04-30" className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Police Station</Label>
                <Select value={station} onValueChange={setStation}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    {stations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Case Type</Label>
                <Select value={caseType} onValueChange={setCaseType}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => toast.success("Report exported", { description: "report.pdf downloaded (simulated)" })}>
              <Download className="h-4 w-4 mr-2" />Export
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="fir">
          <TabsList>
            <TabsTrigger value="fir">FIR Report</TabsTrigger>
            <TabsTrigger value="pcr">PCR Report</TabsTrigger>
            <TabsTrigger value="workload">Officer Workload</TabsTrigger>
          </TabsList>

          <TabsContent value="fir" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 p-5">
                <h3 className="font-semibold mb-4">FIRs by Station</h3>
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={firByStation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold mb-2">Filtered Results</h3>
                <div className="text-3xl font-bold text-primary">{filteredFIR.length}</div>
                <p className="text-xs text-muted-foreground">FIRs matching filters</p>
                <div className="mt-4 space-y-2 max-h-56 overflow-auto">
                  {filteredFIR.slice(0, 8).map((f) => (
                    <div key={f.id} className="text-xs p-2 bg-muted/40 rounded">
                      <div className="font-mono font-semibold">{f.firNumber}</div>
                      <div className="text-muted-foreground">{f.crimeType} · {f.station}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pcr" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">PCR Calls by Status</h3>
              <div className="h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pcrByStatus} cx="50%" cy="50%" outerRadius={110} dataKey="value" label>
                      {pcrByStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="workload" className="mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Officer Workload (Total Cases Assigned)</h3>
              <div className="h-80">
                <ResponsiveContainer>
                  <BarChart data={officerWorkload} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={140} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="cases" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
