import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Accused() {
  const { accused, fir } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const current = accused.find((a) => a.id === selected);
  const linked = current ? fir.filter((f) => current.linkedFIRs.includes(f.id)) : [];

  return (
    <AppLayout title="Accused / Person Profiles">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Person Profiles</h2>
          <p className="text-sm text-muted-foreground">{accused.length} individuals on record</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accused.map((a) => (
            <Card key={a.id} onClick={() => setSelected(a.id)} className="p-4 cursor-pointer hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground font-bold">
                  {a.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.age}y · {a.gender}</div>
                  <div className="mt-2"><StatusBadge status={a.arrestStatus} /></div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between text-xs">
                <span className="text-muted-foreground">Linked FIRs</span>
                <span className="font-semibold">{a.linkedFIRs.length}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {current && (
            <>
              <SheetHeader>
                <SheetTitle>{current.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {current.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{current.name}</div>
                    <div className="text-sm text-muted-foreground">{current.age} years · {current.gender}</div>
                    <div className="mt-1"><StatusBadge status={current.arrestStatus} /></div>
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-xs text-muted-foreground">Address</div>
                  <div>{current.address}</div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Linked FIRs ({linked.length})</div>
                  <div className="space-y-2">
                    {linked.map((f) => (
                      <div key={f.id} className="p-3 bg-muted/40 rounded-md">
                        <div className="flex justify-between items-center">
                          <div className="font-mono text-xs font-semibold">{f.firNumber}</div>
                          <StatusBadge status={f.status} />
                        </div>
                        <div className="text-sm mt-1">{f.crimeType}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{f.station} · {f.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Criminal History</div>
                  {current.history.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic">No prior records</div>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {current.history.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-destructive mt-1">●</span>{h}
                        </li>
                      ))}
                    </ul>
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
