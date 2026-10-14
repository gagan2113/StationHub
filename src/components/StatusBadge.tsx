import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  className?: string;
}

const map: Record<string, string> = {
  // PCR / General status
  "Pending": "bg-destructive/15 text-destructive border-destructive/30",
  "In Progress": "bg-warning/15 text-warning border-warning/40",
  "Closed": "bg-success/15 text-success border-success/30",
  "Resolved": "bg-success/15 text-success border-success/30",
  // FIR status
  "Open": "bg-destructive/15 text-destructive border-destructive/30",
  "Under Investigation": "bg-warning/15 text-warning border-warning/40",
  "Charge-sheeted": "bg-info/15 text-info border-info/30",
  // e-FIR status
  "Submitted": "bg-muted text-muted-foreground border-border",
  "Under Review": "bg-warning/15 text-warning border-warning/40",
  "Approved": "bg-success/15 text-success border-success/30",
  "Rejected": "bg-destructive/15 text-destructive border-destructive/30",
  "Converted": "bg-info/15 text-info border-info/30",
  // Arrest status
  "Arrested": "bg-destructive/15 text-destructive border-destructive/30",
  "On Bail": "bg-warning/15 text-warning border-warning/40",
  "Absconding": "bg-destructive/20 text-destructive border-destructive/40",
  "Released": "bg-success/15 text-success border-success/30",
  // Sentiment
  "Negative": "bg-destructive/15 text-destructive border-destructive/30",
  "Positive": "bg-success/15 text-success border-success/30",
  "Neutral": "bg-muted text-muted-foreground border-border",
  "Mixed": "bg-warning/15 text-warning border-warning/40",
  // Urgency / Priority / Severity
  "Critical": "bg-destructive/20 text-destructive border-destructive/40",
  "High": "bg-destructive/15 text-destructive border-destructive/30",
  "Medium": "bg-warning/15 text-warning border-warning/40",
  "Low": "bg-success/15 text-success border-success/30",
  // Hotspot severity
  "Moderate": "bg-warning/15 text-warning border-warning/40",
  // Patrol status
  "Accepted": "bg-success/15 text-success border-success/30",
  "Dismissed": "bg-muted text-muted-foreground border-border",
  // Pattern status
  "Active": "bg-destructive/15 text-destructive border-destructive/30",
  "Monitoring": "bg-warning/15 text-warning border-warning/40",
  // Recovery status
  "In Custody": "bg-info/15 text-info border-info/30",
  "Returned": "bg-success/15 text-success border-success/30",
  "Destroyed": "bg-muted text-muted-foreground border-border",
  "Transferred": "bg-info/15 text-info border-info/30",
  "Auctioned": "bg-muted text-muted-foreground border-border",
  // Email status
  "Unread": "bg-destructive/15 text-destructive border-destructive/30",
  "Read": "bg-muted text-muted-foreground border-border",
  "Actioned": "bg-success/15 text-success border-success/30",
  "Archived": "bg-muted text-muted-foreground border-border",
  // Trend
  "Increasing": "bg-destructive/15 text-destructive border-destructive/30",
  "Stable": "bg-warning/15 text-warning border-warning/40",
  "Decreasing": "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ status, className }: Props) {
  return (
    <Badge variant="outline" className={cn("font-medium border", map[status] ?? "bg-muted text-muted-foreground border-border", className)}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status}
    </Badge>
  );
}
