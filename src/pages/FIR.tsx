import { AppLayout } from "@/components/AppLayout";
import { useStore, FIRStatus } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Eye } from "lucide-react";
import { toast } from "sonner";

export default function FIR() {
  const { fir, accused, updateFIRStatus, linkAccusedToFIR } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [linkAccusedId, setLinkAccusedId] = useState<string>("");

  const current = fir.find((f) => f.id === openId);

  return (
    <AppLayout title="FIR Management">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">First Information Reports</h2>
          <p className="text-sm text-muted-foreground">{fir.length} cases registered</p>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>FIR No.</th><th>Station</th><th>Date</th><th>Crime</th>
                  <th>IO</th><th>Status</th><th>Accused</th><th></th>
                </tr>
              </thead>
              <tbody>
                {fir.map((f) => (
                  <tr key={f.id} onClick={() => setOpenId(f.id)}>
                    <td className="font-mono text-xs font-semibold">{f.firNumber}</td>
                    <td>{f.station}</td>
                    <td className="text-muted-foreground">{f.date}</td>
                    <td className="font-medium">{f.crimeType}</td>
                    <td className="text-sm">{f.io}</td>
                    <td><StatusBadge status={f.status} /></td>
                    <td>
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {f.accusedIds.length}
                      </span>
                    </td>
                    <td>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setOpenId(f.id); }}>
                        <Eye className="h-3 w-3 mr-1" />View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={!!openId} onOpenChange={(o) => { if (!o) { setOpenId(null); setLinkAccusedId(""); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {current && (
            <>
              <DialogHeader>
                <DialogTitle className="font-mono text-lg">{current.firNumber}</DialogTitle>
                <DialogDescription>{current.station} · {current.date}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted/40 rounded-md">
                    <div className="text-xs text-muted-foreground">Crime Type</div>
                    <div className="font-semibold mt-0.5">{current.crimeType}</div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-md">
                    <div className="text-xs text-muted-foreground">Investigating Officer</div>
                    <div className="font-semibold mt-0.5">{current.io}</div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-md">
                    <div className="text-xs text-muted-foreground">Complainant</div>
                    <div className="font-semibold mt-0.5">{current.complainant}</div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-md">
                    <div className="text-xs text-muted-foreground">Source</div>
                    <div className="font-semibold mt-0.5">
                      {current.sourcePCR ? "PCR Call" : current.sourceEFIR ? "e-FIR" : "Direct"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <p className="text-sm bg-muted/40 p-3 rounded-md">{current.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Update Status</label>
                    <Select
                      value={current.status}
                      onValueChange={(v) => {
                        updateFIRStatus(current.id, v as FIRStatus);
                        toast.success(`Status updated to ${v}`);
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(["Open","Under Investigation","Charge-sheeted","Closed"] as FIRStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Link Accused</label>
                    <div className="flex gap-2">
                      <Select value={linkAccusedId} onValueChange={setLinkAccusedId}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          {accused.filter((a) => !current.accusedIds.includes(a.id)).map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        disabled={!linkAccusedId}
                        onClick={() => {
                          linkAccusedToFIR(current.id, linkAccusedId);
                          toast.success("Accused linked to FIR");
                          setLinkAccusedId("");
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Linked Accused ({current.accusedIds.length})</div>
                  <div className="space-y-1.5">
                    {current.accusedIds.length === 0 && <div className="text-sm text-muted-foreground italic">None linked yet</div>}
                    {current.accusedIds.map((id) => {
                      const a = accused.find((x) => x.id === id);
                      if (!a) return null;
                      return (
                        <div key={id} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-md">
                          <div>
                            <div className="font-medium text-sm">{a.name}</div>
                            <div className="text-xs text-muted-foreground">{a.age}y · {a.gender} · {a.address}</div>
                          </div>
                          <StatusBadge status={a.arrestStatus} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
