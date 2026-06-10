import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function Property() {
  const { property, fir } = useStore();
  const totalValue = property.reduce((s, p) => s + p.value, 0);

  return (
    <AppLayout title="Property Recovery">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Recovered & Seized Property</h2>
            <p className="text-sm text-muted-foreground">{property.length} items in malkhana</p>
          </div>
          <Card className="px-4 py-2 flex items-center gap-3 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <Package className="h-5 w-5 text-accent" />
            <div>
              <div className="text-xs text-muted-foreground">Total Value</div>
              <div className="font-bold text-lg">₹ {totalValue.toLocaleString("en-IN")}</div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th><th>Qty</th><th>Value (₹)</th><th>Linked FIR</th><th>Type</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {property.map((p) => {
                  const f = fir.find((x) => x.id === p.linkedFIR);
                  return (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td>{p.qty}</td>
                      <td className="font-mono">{p.value.toLocaleString("en-IN")}</td>
                      <td className="font-mono text-xs text-primary">{f?.firNumber ?? "—"}</td>
                      <td>
                        <Badge variant="outline" className={
                          p.seizureType === "Stolen" ? "border-destructive/40 text-destructive" :
                          p.seizureType === "Recovered" ? "border-success/40 text-success" :
                          p.seizureType === "Seized" ? "border-warning/40 text-warning" :
                          "border-info/40 text-info"
                        }>{p.seizureType}</Badge>
                      </td>
                      <td className="text-muted-foreground">{p.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
