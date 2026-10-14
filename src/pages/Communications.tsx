import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/store/PoliceStore";
import { StatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Phone, Mail, Search, Filter, Clock, MapPin, User, Tag, Zap,
  ChevronRight, MessageSquare, Brain, FileText, AlertTriangle,
} from "lucide-react";
import type { PCRCall, EmailRecord } from "@/store/PoliceStore";

type CommType = "all" | "calls" | "emails";

const parseTranscript = (text: string) => {
  const lines = text.split("\n");
  const messages: Array<{ time: string; speaker: "OPERATOR" | "CALLER"; text: string }> = [];
  for (const line of lines) {
    const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\] (OPERATOR|CALLER): (.+)$/);
    if (match) {
      messages.push({ time: match[1], speaker: match[2] as "OPERATOR" | "CALLER", text: match[3] });
    }
  }
  return messages;
};

export default function Communications() {
  const { pcr, emails, updateEmailStatus, updatePCRStatus } = useStore();
  const [filter, setFilter] = useState<CommType>("all");
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedCall, setSelectedCall] = useState<PCRCall | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);

  const filteredCalls = pcr.filter((c) => {
    if (filter === "emails") return false;
    const q = search.toLowerCase();
    const matchSearch = !q || c.callerName.toLowerCase().includes(q) || c.callType.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.ddNumber.toLowerCase().includes(q);
    const matchSentiment = sentimentFilter === "all" || c.sentiment === sentimentFilter;
    const matchUrgency = urgencyFilter === "all" || c.urgency === urgencyFilter;
    return matchSearch && matchSentiment && matchUrgency;
  });

  const filteredEmails = emails.filter((e) => {
    if (filter === "calls") return false;
    const q = search.toLowerCase();
    const matchSearch = !q || e.sender.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q) || "";
    const matchSentiment = sentimentFilter === "all" || e.sentiment === sentimentFilter;
    const matchUrgency = urgencyFilter === "all" || e.priority === urgencyFilter;
    return matchSearch && matchSentiment && matchUrgency;
  });

  const totalUnread = emails.filter((e) => e.status === "Unread").length + pcr.filter((p) => p.status === "Pending").length;

  const openCall = (call: PCRCall) => {
    setSelectedCall(call);
    setSelectedEmail(null);
  };

  const openEmail = (email: EmailRecord) => {
    setSelectedEmail(email);
    setSelectedCall(null);
    if (email.status === "Unread") updateEmailStatus(email.id, "Read");
  };

  const actionEmail = (id: string) => {
    updateEmailStatus(id, "Actioned");
    toast.success("Email marked as actioned");
    setSelectedEmail(null);
  };

  const closePCR = (id: string) => {
    updatePCRStatus(id, "Closed");
    toast.success("Call status updated to Closed");
    setSelectedCall(null);
  };

  return (
    <AppLayout title="Calls & Email Intelligence">
      <div className="space-y-4">
        {/* Header stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Calls", value: pcr.length, icon: Phone, color: "text-info" },
            { label: "Total Emails", value: emails.length, icon: Mail, color: "text-primary" },
            { label: "Unread / Pending", value: totalUnread, icon: AlertTriangle, color: "text-warning" },
            { label: "Negative Sentiment", value: [...pcr, ...emails].filter((c) => ("sentiment" in c ? c.sentiment : "") === "Negative").length, icon: Brain, color: "text-destructive" },
          ].map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(["all", "calls", "emails"] as CommType[]).map((t) => (
                <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${filter === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                  {t === "all" ? "All" : t === "calls" ? "Calls" : "Emails"}
                  {t === "calls" && <span className="ml-1.5 text-xs text-muted-foreground">({pcr.length})</span>}
                  {t === "emails" && <span className="ml-1.5 text-xs text-muted-foreground">({emails.length})</span>}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, type, location..." className="pl-8 h-9" />
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Sentiment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="Negative">Negative</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Positive">Positive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Urgency" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Calls section */}
        {filter !== "emails" && filteredCalls.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <Phone className="h-4 w-4 text-info" />
              <h3 className="font-semibold text-sm">PCR Calls</h3>
              <Badge variant="outline" className="ml-1 text-xs">{filteredCalls.length}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DD No.</th><th>Time</th><th>Caller</th><th>Type</th><th>Location</th><th>Duration</th><th>Sentiment</th><th>Urgency</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCalls.map((c) => (
                    <tr key={c.id} onClick={() => openCall(c)} className="cursor-pointer">
                      <td className="font-mono text-xs">{c.ddNumber}</td>
                      <td className="text-xs text-muted-foreground whitespace-nowrap">{c.callTime}</td>
                      <td className="font-medium text-sm">{c.callerName}</td>
                      <td className="text-sm">{c.callType}</td>
                      <td className="text-xs text-muted-foreground max-w-[160px] truncate">{c.location}</td>
                      <td className="text-xs">{c.duration ? `${c.duration}m` : "—"}</td>
                      <td>{c.sentiment ? <StatusBadge status={c.sentiment} /> : <span className="text-muted-foreground text-xs">—</span>}</td>
                      <td>{c.urgency ? <StatusBadge status={c.urgency} /> : <span className="text-muted-foreground text-xs">—</span>}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Emails section */}
        {filter !== "calls" && filteredEmails.length > 0 && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Email Intelligence</h3>
              <Badge variant="outline" className="ml-1 text-xs">{filteredEmails.length}</Badge>
            </div>
            <div className="divide-y">
              {filteredEmails.map((e) => (
                <div key={e.id} onClick={() => openEmail(e)} className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${e.status === "Unread" ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                        {e.sender.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${e.status === "Unread" ? "font-bold" : ""}`}>{e.subject}</span>
                          {e.status === "Unread" && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{e.sender} · {e.receivedAt}</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">{e.bodyPreview}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={e.priority} />
                      <StatusBadge status={e.sentiment} />
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                  {e.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 ml-11">
                      {e.keywords.slice(0, 4).map((k) => (
                        <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{k}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {filteredCalls.length === 0 && filteredEmails.length === 0 && (
          <Card className="p-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No communications match the current filters.</p>
          </Card>
        )}
      </div>

      {/* Call detail sheet */}
      <Sheet open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedCall && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-info" />
                  <SheetTitle className="text-base">{selectedCall.ddNumber} — {selectedCall.callType}</SheetTitle>
                </div>
              </SheetHeader>
              <Tabs defaultValue="overview">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="transcript" className="flex-1">Transcript</TabsTrigger>
                  <TabsTrigger value="analysis" className="flex-1">AI Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Caller", value: selectedCall.callerName, icon: User },
                      { label: "Time", value: selectedCall.callTime, icon: Clock },
                      { label: "Location", value: selectedCall.location, icon: MapPin },
                      { label: "Duration", value: selectedCall.duration ? `${selectedCall.duration} min` : "Not recorded", icon: Clock },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-3 rounded-lg bg-muted/40 border">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Icon className="h-3 w-3" />{label}
                        </div>
                        <div className="text-sm font-medium">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={selectedCall.status} />
                    {selectedCall.sentiment && <StatusBadge status={selectedCall.sentiment} />}
                    {selectedCall.urgency && <StatusBadge status={selectedCall.urgency} />}
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border">
                    <div className="text-xs text-muted-foreground mb-1">Description</div>
                    <p className="text-sm">{selectedCall.description}</p>
                  </div>
                  {selectedCall.entities && selectedCall.entities.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Tag className="h-3 w-3" />Extracted Entities</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCall.entities.map((e, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{e.type}: {e.value}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCall.followUpActions && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Zap className="h-3 w-3" />Suggested Follow-up Actions</div>
                      <ul className="space-y-1.5">
                        {selectedCall.followUpActions.map((a, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedCall.status !== "Closed" && (
                    <div className="pt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => closePCR(selectedCall.id)}>Mark as Closed</Button>
                      {!selectedCall.convertedToFIR && <Button size="sm" variant="default">Convert to FIR</Button>}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="transcript" className="space-y-3">
                  {selectedCall.transcript ? (
                    <>
                      {/* Call info bar */}
                      <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: "rgba(37,99,235,0.05)", borderColor: "rgba(37,99,235,0.18)" }}>
                        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(37,99,235,0.10)" }}>
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold">{selectedCall.ddNumber} · {selectedCall.callType}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{selectedCall.callerName} · {selectedCall.callTime}{selectedCall.duration ? ` · ${selectedCall.duration} min` : ""}</div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary inline-block" />Operator</span>
                          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground/40 inline-block" />Caller</span>
                        </div>
                      </div>

                      {/* Chat bubbles */}
                      <div className="space-y-2.5 px-1 py-1 max-h-[480px] overflow-y-auto">
                        {parseTranscript(selectedCall.transcript).map((msg, i) => (
                          <div key={i} className={`flex ${msg.speaker === "OPERATOR" ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[82%] ${msg.speaker === "OPERATOR" ? "" : ""}`}>
                              <div className={`text-[10px] mb-1 font-medium ${msg.speaker === "OPERATOR" ? "text-left text-primary" : "text-right text-muted-foreground"}`}>
                                {msg.speaker === "OPERATOR" ? "Operator" : selectedCall.callerName} &middot; {msg.time}
                              </div>
                              <div
                                className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                                  msg.speaker === "OPERATOR"
                                    ? "rounded-2xl rounded-tl-sm text-white"
                                    : "rounded-2xl rounded-tr-sm border"
                                }`}
                                style={msg.speaker === "OPERATOR"
                                  ? { background: "hsl(var(--primary))" }
                                  : { background: "rgba(255,255,255,0.80)", borderColor: "rgba(200,215,240,0.65)" }
                                }
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Transcript not available for this call.</p>
                      <p className="text-xs mt-1">Auto-generated or legacy calls may not have recordings.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  {selectedCall.aiSummary && (
                    <div className="p-4 rounded-lg bg-muted/40 border">
                      <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Brain className="h-3 w-3" />AI Summary</div>
                      <p className="text-sm leading-relaxed">{selectedCall.aiSummary}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
                      {selectedCall.sentiment ? <StatusBadge status={selectedCall.sentiment} /> : <span className="text-sm text-muted-foreground">—</span>}
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <div className="text-xs text-muted-foreground mb-1">Urgency Level</div>
                      {selectedCall.urgency ? <StatusBadge status={selectedCall.urgency} /> : <span className="text-sm text-muted-foreground">—</span>}
                    </div>
                  </div>
                  {selectedCall.keywords && selectedCall.keywords.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Key Topics</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCall.keywords.map((k) => (
                          <span key={k} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Email detail sheet */}
      <Sheet open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedEmail && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <SheetTitle className="text-base leading-tight">{selectedEmail.subject}</SheetTitle>
                </div>
              </SheetHeader>
              <Tabs defaultValue="content">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="content" className="flex-1">Email Content</TabsTrigger>
                  <TabsTrigger value="analysis" className="flex-1">AI Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-0">
                  <div className="rounded-xl border overflow-hidden">
                    {/* Email header */}
                    <div className="p-4 border-b" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)" }}>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(217 91% 62%))" }}>
                          {selectedEmail.sender.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm leading-tight">{selectedEmail.subject}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">{selectedEmail.sender}</span>
                            <span className="mx-1">·</span>
                            <span className="font-mono">{selectedEmail.senderEmail}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedEmail.receivedAt}</span>
                            {selectedEmail.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedEmail.location}</span>}
                            {selectedEmail.linkedFIR && <span className="flex items-center gap-1 text-primary font-mono font-semibold"><FileText className="h-3 w-3" />{selectedEmail.linkedFIR}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <StatusBadge status={selectedEmail.priority} />
                          <StatusBadge status={selectedEmail.sentiment} />
                        </div>
                      </div>
                    </div>

                    {/* Email body */}
                    <div className="p-5" style={{ background: "rgba(255,255,255,0.55)" }}>
                      <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {selectedEmail.fullBody}
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between px-4 py-3 border-t" style={{ background: "rgba(255,255,255,0.40)" }}>
                      <StatusBadge status={selectedEmail.status} />
                      <div className="flex gap-2">
                        {selectedEmail.status !== "Actioned" && (
                          <Button size="sm" onClick={() => actionEmail(selectedEmail.id)}>Mark as Actioned</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { updateEmailStatus(selectedEmail.id, "Archived"); setSelectedEmail(null); toast.info("Email archived"); }}>Archive</Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/40 border">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Brain className="h-3 w-3" />AI Summary</div>
                    <p className="text-sm leading-relaxed">{selectedEmail.aiSummary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
                      <StatusBadge status={selectedEmail.sentiment} />
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                      <span className="font-semibold">{(selectedEmail.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  {selectedEmail.entities.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Extracted Entities</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmail.entities.map((e, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{e.type}: {e.value}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedEmail.keywords.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Key Topics</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEmail.keywords.map((k) => (
                          <span key={k} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedEmail.suggestedActions.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Zap className="h-3 w-3" />Suggested Actions</div>
                      <ul className="space-y-1.5">
                        {selectedEmail.suggestedActions.map((a, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
