import { AppLayout } from "@/components/AppLayout";
import { useStore, type PCRCall } from "@/store/PoliceStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FileText, Phone, Brain, MapPin, AlertTriangle, Activity, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Severity = "Low" | "Medium" | "High" | "Critical";
type TranscriptLine = { speaker: "Caller" | "Operator"; text: string; time: string };
type AISummary = {
  incidentType: string;
  location: string;
  severity: Severity;
  actionTaken: string;
  currentStatus: string;
  keywords: string[];
};

// Hardcoded transcripts + AI summaries keyed by call type
const transcriptByType: Record<string, TranscriptLine[]> = {
  Theft: [
    { speaker: "Caller", text: "Hello, there is a theft happening near Sector 21 market.", time: "00:00" },
    { speaker: "Operator", text: "Please stay calm. Can you describe the situation?", time: "00:05" },
    { speaker: "Caller", text: "Do log hain, ek parked car ka sheesha tod rahe hain.", time: "00:11" },
    { speaker: "Operator", text: "Are they armed? How many people exactly?", time: "00:18" },
    { speaker: "Caller", text: "Two men, one wearing a black hoodie. No weapons visible.", time: "00:24" },
    { speaker: "Operator", text: "PCR unit is being dispatched to your location. Please stay safe and do not approach them.", time: "00:32" },
    { speaker: "Caller", text: "Theek hai, main door se dekh raha hoon.", time: "00:40" },
  ],
  Burglary: [
    { speaker: "Caller", text: "Someone has broken into my house! I just came back from work.", time: "00:00" },
    { speaker: "Operator", text: "Are you safe right now? Is anyone still inside?", time: "00:06" },
    { speaker: "Caller", text: "Pata nahi, darwaza tuta hua hai, main bahar khada hoon.", time: "00:13" },
    { speaker: "Operator", text: "Do not enter the house. Stay outside, a unit is on the way.", time: "00:21" },
    { speaker: "Caller", text: "Please jaldi bhejiye, mere bachhe ghar par the.", time: "00:28" },
    { speaker: "Operator", text: "Unit dispatched. ETA 4 minutes. Stay on the line with me.", time: "00:34" },
  ],
  Assault: [
    { speaker: "Caller", text: "There's a fight outside the bus stand, someone is bleeding!", time: "00:00" },
    { speaker: "Operator", text: "How many people are involved? Any weapons?", time: "00:05" },
    { speaker: "Caller", text: "Char-paanch log hain, ek aadmi ke paas danda hai.", time: "00:12" },
    { speaker: "Operator", text: "Stay at a safe distance. Ambulance and PCR unit dispatched.", time: "00:19" },
    { speaker: "Caller", text: "Aadmi behosh ho gaya hai, please jaldi.", time: "00:26" },
  ],
  "Domestic Dispute": [
    { speaker: "Caller", text: "My neighbours are fighting loudly, I can hear screaming.", time: "00:00" },
    { speaker: "Operator", text: "Do you suspect physical violence?", time: "00:07" },
    { speaker: "Caller", text: "Haan, awaazein bahut tez aa rahi hain, bartan toot rahe hain.", time: "00:14" },
    { speaker: "Operator", text: "Noted. A female officer will be sent along with the unit.", time: "00:22" },
  ],
  "Traffic Accident": [
    { speaker: "Caller", text: "Major accident on the highway, two cars collided!", time: "00:00" },
    { speaker: "Operator", text: "Are there any injuries? Is the road blocked?", time: "00:05" },
    { speaker: "Caller", text: "Haan, ek driver phasa hua hai gaadi mein. Traffic ruk gayi hai.", time: "00:12" },
    { speaker: "Operator", text: "Dispatching ambulance, traffic police, and fire rescue immediately.", time: "00:20" },
    { speaker: "Caller", text: "Please jaldi, bahut khoon nikal raha hai.", time: "00:27" },
  ],
  "Noise Complaint": [
    { speaker: "Caller", text: "There is loud music being played past midnight in my neighbourhood.", time: "00:00" },
    { speaker: "Operator", text: "Is this a regular issue or one-time event?", time: "00:06" },
    { speaker: "Caller", text: "Roz hota hai, soone nahi deta. Bachhon ke exam chal rahe hain.", time: "00:13" },
    { speaker: "Operator", text: "We will send a constable to issue a warning. Thank you for reporting.", time: "00:21" },
  ],
  "Missing Person": [
    { speaker: "Caller", text: "My daughter hasn't returned home from school, it's been 5 hours.", time: "00:00" },
    { speaker: "Operator", text: "What is her age and last known location?", time: "00:06" },
    { speaker: "Caller", text: "12 saal ki hai, school bus stop ke paas se gayab hai.", time: "00:13" },
    { speaker: "Operator", text: "Please share a recent photograph. We are issuing an immediate alert.", time: "00:21" },
    { speaker: "Caller", text: "Bhej raha hoon WhatsApp par. Please dhundiye usse.", time: "00:28" },
  ],
  "Suspicious Activity": [
    { speaker: "Caller", text: "There's an unknown vehicle parked outside my house for hours.", time: "00:00" },
    { speaker: "Operator", text: "Can you describe the vehicle and any occupants?", time: "00:06" },
    { speaker: "Caller", text: "Black SUV, do log andar baithe hain, kuch dekh rahe hain.", time: "00:14" },
    { speaker: "Operator", text: "Note the number plate if possible. Patrol unit will check the area.", time: "00:22" },
  ],
};

const summaryByType: Record<string, Omit<AISummary, "location" | "currentStatus">> = {
  Theft: {
    incidentType: "Theft Attempt",
    severity: "Medium",
    actionTaken: "PCR unit dispatched, witness asked to stay indoors",
    keywords: ["parked car", "two suspects", "no weapons"],
  },
  Burglary: {
    incidentType: "House Break-in",
    severity: "High",
    actionTaken: "PCR unit + forensics dispatched, perimeter secured",
    keywords: ["broken door", "family safe", "possible intruder inside"],
  },
  Assault: {
    incidentType: "Physical Assault",
    severity: "High",
    actionTaken: "PCR unit + ambulance dispatched",
    keywords: ["multiple suspects", "weapon: stick", "victim injured"],
  },
  "Domestic Dispute": {
    incidentType: "Domestic Violence (suspected)",
    severity: "Medium",
    actionTaken: "Female officer + PCR unit dispatched",
    keywords: ["loud argument", "objects breaking", "neighbour reported"],
  },
  "Traffic Accident": {
    incidentType: "Road Traffic Accident",
    severity: "Critical",
    actionTaken: "Ambulance, traffic police, fire rescue dispatched",
    keywords: ["two-vehicle collision", "trapped driver", "highway blocked"],
  },
  "Noise Complaint": {
    incidentType: "Public Nuisance",
    severity: "Low",
    actionTaken: "Constable assigned to issue warning",
    keywords: ["loud music", "recurring", "late hours"],
  },
  "Missing Person": {
    incidentType: "Missing Minor",
    severity: "Critical",
    actionTaken: "Area-wide alert issued, photo requested",
    keywords: ["minor", "school zone", "5 hours overdue"],
  },
  "Suspicious Activity": {
    incidentType: "Suspicious Surveillance",
    severity: "Low",
    actionTaken: "Patrol unit deployed for area check",
    keywords: ["unknown vehicle", "two occupants", "extended stay"],
  },
};

const getTranscript = (call: PCRCall): TranscriptLine[] =>
  transcriptByType[call.callType] ?? transcriptByType.Theft;

const getSummary = (call: PCRCall): AISummary => {
  const base = summaryByType[call.callType] ?? summaryByType.Theft;
  return {
    ...base,
    location: call.location,
    currentStatus: call.convertedToFIR ? "Converted to FIR" : call.status,
  };
};

const severityClass = (s: Severity) => {
  switch (s) {
    case "Critical": return "bg-destructive/15 text-destructive border-destructive/30";
    case "High": return "bg-destructive/10 text-destructive border-destructive/20";
    case "Medium": return "bg-warning/15 text-warning border-warning/30";
    case "Low": return "bg-success/15 text-success border-success/30";
  }
};

export default function PCR() {
  const { pcr, convertPCRtoFIR } = useStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const filtered = pcr.filter((c) =>
    [c.ddNumber, c.callerName, c.callType, c.officer].some((v) => v.toLowerCase().includes(q.toLowerCase())),
  );

  const current = pcr.find((c) => c.id === selected);

  const handleConvert = (id: string) => {
    const firId = convertPCRtoFIR(id);
    toast.success("PCR converted to FIR", {
      description: `New FIR created — id: ${firId.slice(0, 18)}...`,
      action: { label: "View FIR", onClick: () => nav("/fir") },
    });
    setSelected(null);
  };

  return (
    <AppLayout title="PCR Call Logging">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Police Control Room — Call Log</h2>
            <p className="text-sm text-muted-foreground">{pcr.length} total calls · click any row for details</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search calls..." className="pl-8 w-72" />
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DD Number</th><th>Call Time</th><th>Caller</th><th>Phone</th>
                  <th>Type</th><th>Officer</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} onClick={() => setSelected(c.id)}>
                    <td className="font-mono text-xs font-semibold">{c.ddNumber}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{c.callTime}</td>
                    <td className="font-medium">{c.callerName}</td>
                    <td className="font-mono text-xs">{c.phone}</td>
                    <td>{c.callType}</td>
                    <td className="text-sm">{c.officer}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.convertedToFIR ? (
                        <span className="text-xs text-success font-medium">✓ Converted</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleConvert(c.id); }}>
                          <FileText className="h-3 w-3 mr-1" />Convert
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {current && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  {current.ddNumber}
                </SheetTitle>
                <SheetDescription>PCR call details · {current.callType}</SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">
                    <FileText className="h-3.5 w-3.5 mr-1.5" />Overview
                  </TabsTrigger>
                  <TabsTrigger value="transcript">
                    <Phone className="h-3.5 w-3.5 mr-1.5" />Transcript
                  </TabsTrigger>
                  <TabsTrigger value="ai">
                    <Brain className="h-3.5 w-3.5 mr-1.5" />AI Summary
                  </TabsTrigger>
                </TabsList>

                {/* OVERVIEW */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <StatusBadge status={current.status} />
                  </div>
                  {[
                    ["Caller Name", current.callerName],
                    ["Phone", current.phone],
                    ["Call Time", current.callTime],
                    ["Call Type", current.callType],
                    ["Location", current.location],
                    ["Assigned Officer", current.officer],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium text-right">{v}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <div className="text-sm text-muted-foreground mb-1">Description</div>
                    <p className="text-sm">{current.description}</p>
                  </div>
                  {!current.convertedToFIR && (
                    <Button className="w-full" onClick={() => handleConvert(current.id)}>
                      <FileText className="h-4 w-4 mr-2" />Convert to FIR
                    </Button>
                  )}
                </TabsContent>

                {/* TRANSCRIPT */}
                <TabsContent value="transcript" className="mt-4">
                  <Card className="p-3">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <Phone className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Call Transcript</h3>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {getTranscript(current).length} messages
                      </span>
                    </div>
                    <ScrollArea className="h-[420px] pr-3">
                      <div className="space-y-3">
                        {getTranscript(current).map((line, i) => {
                          const isCaller = line.speaker === "Caller";
                          return (
                            <div key={i} className={`flex ${isCaller ? "justify-start" : "justify-end"}`}>
                              <div
                                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                  isCaller
                                    ? "bg-muted text-foreground rounded-bl-sm"
                                    : "bg-primary text-primary-foreground rounded-br-sm"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3 mb-0.5">
                                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                                    isCaller ? "text-muted-foreground" : "text-primary-foreground/80"
                                  }`}>
                                    {line.speaker}
                                  </span>
                                  <span className={`text-[10px] ${
                                    isCaller ? "text-muted-foreground" : "text-primary-foreground/70"
                                  }`}>
                                    {line.time}
                                  </span>
                                </div>
                                <p className="leading-snug">{line.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>

                {/* AI SUMMARY */}
                <TabsContent value="ai" className="mt-4 space-y-3">
                  {(() => {
                    const s = getSummary(current);
                    return (
                      <>
                        <Card className="p-4 border-l-4 border-l-primary">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-semibold">AI-Generated Summary</h3>
                            <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              Auto
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="text-[11px] uppercase text-muted-foreground tracking-wide">Incident Type</div>
                                <div className="text-sm font-medium">{s.incidentType}</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-info mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="text-[11px] uppercase text-muted-foreground tracking-wide">Location</div>
                                <div className="text-sm font-medium">{s.location}</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Activity className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="text-[11px] uppercase text-muted-foreground tracking-wide">Severity</div>
                                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${severityClass(s.severity)}`}>
                                  {s.severity}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <ShieldCheck className="h-4 w-4 text-success mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="text-[11px] uppercase text-muted-foreground tracking-wide">Action Taken</div>
                                <div className="text-sm font-medium">{s.actionTaken}</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="text-[11px] uppercase text-muted-foreground tracking-wide">Current Status</div>
                                <div className="text-sm font-medium">{s.currentStatus}</div>
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="text-[11px] uppercase text-muted-foreground tracking-wide mb-2">
                            Detected Keywords
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {s.keywords.map((k) => (
                              <span key={k} className="text-xs px-2 py-1 rounded-full bg-accent/50 border border-border">
                                {k}
                              </span>
                            ))}
                          </div>
                        </Card>
                      </>
                    );
                  })()}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
