import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  className?: string;
}

const map: Record<string, string> = {
  // PCR
  "Pending": "bg-destructive/15 text-destructive border-destructive/30",
  "In Progress": "bg-warning/15 text-warning border-warning/40",
  "Closed": "bg-success/15 text-success border-success/30",
  "Resolved": "bg-success/15 text-success border-success/30",
  // FIR
  "Open": "bg-destructive/15 text-destructive border-destructive/30",
  "Under Investigation": "bg-warning/15 text-warning border-warning/40",
  "Charge-sheeted": "bg-info/15 text-info border-info/30",
  // e-FIR
  "Submitted": "bg-muted text-muted-foreground border-border",
  "Under Review": "bg-warning/15 text-warning border-warning/40",
  "Approved": "bg-success/15 text-success border-success/30",
  "Rejected": "bg-destructive/15 text-destructive border-destructive/30",
  "Converted": "bg-info/15 text-info border-info/30",
  // Arrest
  "Arrested": "bg-destructive/15 text-destructive border-destructive/30",
  "On Bail": "bg-warning/15 text-warning border-warning/40",
  "Absconding": "bg-destructive/20 text-destructive border-destructive/40",
  "Released": "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ status, className }: Props) {
  return (
    <Badge variant="outline" className={cn("font-medium border", map[status] ?? "bg-muted", className)}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </Badge>
  );
}
