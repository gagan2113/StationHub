import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Check, X, FileText } from "lucide-react";
import { toast } from "sonner";

export default function EFIR() {
  const { efir, updateEFIR, convertEFIRtoFIR } = useStore();

  return (
    <AppLayout title="e-FIR">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">e-FIR Submissions</h2>
          <p className="text-sm text-muted-foreground">Online complaints from citizen portal · workflow: Submitted → Under Review → Approved/Rejected → Converted</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {efir.map((e) => (
            <Card key={e.id} className="p-4 hover:shadow-[var(--shadow-md)] transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{e.efirNumber}</div>
                  <div className="font-semibold mt-1">{e.incidentType}</div>
                </div>
                <StatusBadge status={e.status} />
              </div>
              <div className="text-xs text-muted-foreground space-y-1 mb-3">
                <div>Complainant: <span className="text-foreground font-medium">{e.complainant}</span></div>
                <div>Date: {e.date}</div>
              </div>
              <p className="text-xs bg-muted/40 p-2.5 rounded-md mb-3 line-clamp-2">{e.description}</p>

              <div className="flex gap-2 flex-wrap">
                {e.status === "Submitted" && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { updateEFIR(e.id, "Under Review"); toast.info("Moved to Under Review"); }}>
                    Start Review
                  </Button>
                )}
                {e.status === "Under Review" && (
                  <>
                    <Button size="sm" variant="outline" className="flex-1 border-success/40 text-success hover:bg-success/10" onClick={() => { updateEFIR(e.id, "Approved"); toast.success("e-FIR Approved"); }}>
                      <Check className="h-3 w-3 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => { updateEFIR(e.id, "Rejected"); toast.error("e-FIR Rejected"); }}>
                      <X className="h-3 w-3 mr-1" />Reject
                    </Button>
                  </>
                )}
                {e.status === "Approved" && (
                  <Button size="sm" className="w-full" onClick={() => { convertEFIRtoFIR(e.id); toast.success("Converted to FIR"); }}>
                    <FileText className="h-3 w-3 mr-1" />Convert to FIR
                  </Button>
                )}
                {e.status === "Converted" && (
                  <div className="text-xs text-success font-medium w-full text-center py-1.5">✓ Successfully converted to FIR</div>
                )}
                {e.status === "Rejected" && (
                  <div className="text-xs text-destructive font-medium w-full text-center py-1.5">✗ Submission rejected</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
