import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Shield } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export default function Diary() {
  const { pcr, fir, accused, property } = useStore();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const Section = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => (
    <section className="border-t-2 border-foreground/80 pt-3">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-bold uppercase tracking-wide text-sm">{title}</h3>
        <span className="text-xs font-mono text-muted-foreground">[{count} entries]</span>
      </div>
      {children}
    </section>
  );

  return (
    <AppLayout title="Morning Diary">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-3 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />Print Diary
          </Button>
        </div>

        <Card className="p-8 print:shadow-none print:border-0 bg-card">
          <header className="text-center border-b-2 border-foreground pb-4 mb-5">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <div className="font-bold text-xl tracking-wider uppercase">Daily Morning Diary</div>
                <div className="text-xs text-muted-foreground">Police Station — Connaught Place Division</div>
              </div>
            </div>
            <div className="text-sm font-medium mt-2">{today}</div>
            <div className="text-xs text-muted-foreground">Reporting period: Last 24 hours</div>
          </header>

          <div className="space-y-5 text-sm">
            <Section title="1. New PCR Calls" count={pcr.slice(0, 8).length}>
              <ol className="space-y-1.5 list-decimal list-inside">
                {pcr.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <span className="font-mono text-xs">{c.ddNumber}</span> — <span className="font-medium">{c.callType}</span> at {c.location}, caller: {c.callerName}{" "}
                    <StatusBadge status={c.status} className="ml-1" />
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="2. New FIRs Registered" count={fir.slice(0, 5).length}>
              <ol className="space-y-1.5 list-decimal list-inside">
                {fir.slice(0, 5).map((f) => (
                  <li key={f.id}>
                    <span className="font-mono text-xs">{f.firNumber}</span> — {f.crimeType}, IO: {f.io}{" "}
                    <StatusBadge status={f.status} className="ml-1" />
                  </li>
                ))}
              </ol>
            </Section>

            <Section title="3. Pending Cases" count={fir.filter((f) => f.status !== "Closed").length}>
              <p className="text-muted-foreground">
                {fir.filter((f) => f.status === "Open").length} open ·{" "}
                {fir.filter((f) => f.status === "Under Investigation").length} under investigation ·{" "}
                {fir.filter((f) => f.status === "Charge-sheeted").length} charge-sheeted
              </p>
            </Section>

            <Section title="4. Arrest Updates" count={accused.filter((a) => a.arrestStatus === "Arrested").length}>
              <ul className="space-y-1.5 list-disc list-inside">
                {accused.filter((a) => a.arrestStatus === "Arrested").slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <span className="font-medium">{a.name}</span> ({a.age}y, {a.gender}) — apprehended in connection with FIR {a.linkedFIRs[0]?.slice(-3) ?? "N/A"}
                  </li>
                ))}
              </ul>
              {accused.some((a) => a.arrestStatus === "Absconding") && (
                <p className="mt-2 text-xs text-destructive font-medium">
                  ⚠ {accused.filter((a) => a.arrestStatus === "Absconding").length} absconding — search operations active
                </p>
              )}
            </Section>

            <Section title="5. Recovery Updates" count={property.length}>
              <ul className="space-y-1.5 list-disc list-inside">
                {property.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    {p.qty} × <span className="font-medium">{p.name}</span> ({p.seizureType.toLowerCase()}) — value ₹{p.value.toLocaleString("en-IN")}
                  </li>
                ))}
              </ul>
            </Section>

            <footer className="border-t-2 border-foreground pt-3 mt-6 flex justify-between text-xs">
              <div>
                <div className="text-muted-foreground">Reporting Officer</div>
                <div className="font-semibold mt-4 border-t pt-1 w-48">Insp. Rajesh Kumar</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">SHO Signature</div>
                <div className="font-semibold mt-4 border-t pt-1 w-48">_________________</div>
              </div>
            </footer>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
