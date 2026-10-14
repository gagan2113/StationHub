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
import { Package, Search, MapPin, User, Calendar, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { RecoveredItem, RecoveryStatus, ItemCategory } from "@/store/PoliceStore";

const CATEGORY_COLORS: Record<string, string> = {
  Valuables: "hsl(var(--accent))", Electronics: "hsl(var(--info))", Vehicles: "hsl(var(--primary))",
  Currency: "hsl(var(--success))", Weapons: "hsl(var(--destructive))", Documents: "hsl(var(--muted-foreground))",
  Narcotics: "hsl(var(--warning))", Other: "hsl(var(--border))",
};

const chartStyle = { contentStyle: { background: "rgba(255,255,255,0.95)", border: "1px solid rgba(200,215,240,0.70)", borderRadius: 10, fontSize: 12, color: "hsl(222 47% 11%)" }, cursor: { fill: "rgba(0,0,0,0.04)" } };

export default function RecoveredItems() {
  const { recoveredItems, fir, updateRecoveryStatus } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<RecoveredItem | null>(null);

  const categories = [...new Set(recoveredItems.map((i) => i.category))];

  const filtered = recoveredItems.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.itemId.toLowerCase().includes(q) || i.recoveryLocation.toLowerCase().includes(q) || i.linkedCase.toLowerCase().includes(q);
    const matchCat = categoryFilter === "all" || i.category === categoryFilter;
    const matchStatus = statusFilter === "all" || i.recoveryStatus === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const totalValue = recoveredItems.reduce((s, i) => s + i.estimatedValue, 0);
  const inCustody = recoveredItems.filter((i) => i.recoveryStatus === "In Custody").length;
  const returned = recoveredItems.filter((i) => i.recoveryStatus === "Returned").length;

  const categoryData = (categories as ItemCategory[]).map((cat) => ({
    name: cat,
    value: recoveredItems.filter((i) => i.category === cat).length,
  }));

  const valueByCategory = (categories as ItemCategory[]).map((cat) => ({
    name: cat,
    value: recoveredItems.filter((i) => i.category === cat).reduce((s, i) => s + i.estimatedValue, 0),
  })).filter((d) => d.value > 0).sort((a, b) => b.value - a.value);

  const linkedFIR = (item: RecoveredItem) => fir.find((f) => f.id === item.linkedFIR);

  const handleStatus = (id: string, status: RecoveryStatus) => {
    updateRecoveryStatus(id, status);
    toast.success(`Recovery status updated to ${status}`);
    if (selected?.id === id) setSelected((s) => s ? { ...s, recoveryStatus: status } : null);
  };

  return (
    <AppLayout title="Recovered Items">
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Items", value: recoveredItems.length, color: "text-primary" },
            { label: "In Custody", value: inCustody, color: "text-info" },
            { label: "Returned to Owner", value: returned, color: "text-success" },
            { label: "Total Value (₹)", value: `${(totalValue / 100000).toFixed(1)}L`, color: "text-accent" },
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
            <h3 className="font-semibold mb-1 text-sm">Items by Category</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution across item types</p>
            <div className="h-44">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "hsl(var(--muted-foreground))"} />
                    ))}
                  </Pie>
                  <Tooltip {...chartStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {categoryData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[d.name] ?? "hsl(var(--muted-foreground))" }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-1 text-sm">Estimated Value by Category (₹)</h3>
            <p className="text-xs text-muted-foreground mb-4">Items with assessed monetary value</p>
            <div className="h-52">
              <ResponsiveContainer>
                <BarChart data={valueByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={10} width={70} />
                  <Tooltip {...chartStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, "Value"]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {valueByCategory.map((entry) => (
                      <rect key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "hsl(var(--primary))"} />
                    ))}
                  </Bar>
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
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items, FIR, location..." className="pl-8 h-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Custody">In Custody</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Transferred">Transferred</SelectItem>
                <SelectItem value="Destroyed">Destroyed</SelectItem>
                <SelectItem value="Auctioned">Auctioned</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filtered.length} items</span>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Item ID</th><th>Name</th><th>Category</th><th>Value (₹)</th><th>Recovery Date</th><th>Location</th><th>Linked FIR</th><th>Officer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} onClick={() => setSelected(i)} className="cursor-pointer">
                    <td className="font-mono text-xs text-primary">{i.itemId}</td>
                    <td className="font-medium text-sm">{i.name}</td>
                    <td>
                      <Badge variant="outline" className="text-xs" style={{ color: CATEGORY_COLORS[i.category], borderColor: `${CATEGORY_COLORS[i.category]}50` }}>{i.category}</Badge>
                    </td>
                    <td className="text-sm font-semibold">{i.estimatedValue > 0 ? `₹${i.estimatedValue.toLocaleString()}` : "—"}</td>
                    <td className="text-xs text-muted-foreground">{i.recoveryDate}</td>
                    <td className="text-xs text-muted-foreground max-w-[150px] truncate">{i.recoveryLocation}</td>
                    <td className="font-mono text-xs text-primary">{i.linkedCase}</td>
                    <td className="text-sm">{i.assignedOfficer}</td>
                    <td><StatusBadge status={i.recoveryStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center"><Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" /><p className="text-muted-foreground text-sm">No items match the current filters.</p></div>
          )}
        </Card>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-base">{selected.name}</SheetTitle>
                <p className="text-xs text-muted-foreground font-mono">{selected.itemId}</p>
              </SheetHeader>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <StatusBadge status={selected.recoveryStatus} />
                  <Badge variant="outline" className="text-xs">{selected.category}</Badge>
                  {selected.estimatedValue > 0 && <Badge variant="outline" className="text-xs text-success border-success/30">₹{selected.estimatedValue.toLocaleString()}</Badge>}
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <p className="text-sm">{selected.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Quantity", value: String(selected.quantity), icon: Package },
                    { label: "Recovery Date", value: selected.recoveryDate, icon: Calendar },
                    { label: "Officer", value: selected.assignedOfficer, icon: User },
                    { label: "Linked Case", value: selected.linkedCase, icon: FileText },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="p-3 rounded-lg bg-muted/40 border">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Icon className="h-3 w-3" />{label}</div>
                      <div className="text-sm font-medium">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />Recovery Location</div>
                  <div className="text-sm">{selected.recoveryLocation}</div>
                </div>
                {selected.notes && (
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    <p className="text-sm leading-relaxed">{selected.notes}</p>
                  </div>
                )}
                {linkedFIR(selected) && (
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-2">Linked FIR</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-mono text-sm text-primary">{linkedFIR(selected)!.firNumber}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{linkedFIR(selected)!.crimeType} · {linkedFIR(selected)!.station}</div>
                      </div>
                      <StatusBadge status={linkedFIR(selected)!.status} />
                    </div>
                  </div>
                )}

                {/* Status update */}
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-2">Update Recovery Status</div>
                  <div className="flex flex-wrap gap-2">
                    {(["In Custody", "Returned", "Transferred", "Destroyed", "Auctioned"] as RecoveryStatus[]).filter((s) => s !== selected.recoveryStatus).map((s) => (
                      <Button key={s} size="sm" variant="outline" onClick={() => handleStatus(selected.id, s)}>{s}</Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
