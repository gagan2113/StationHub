import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Shield, Bell, Database, Info, Save } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("IST");
  const [analyst, setAnalyst] = useState("Insp. Meera Joshi");
  const [role, setRole] = useState("Intelligence Analyst");
  const [station, setStation] = useState("NCIA Regional HQ, Delhi");

  const handleSave = () => {
    toast.success("Settings saved");
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-5 max-w-3xl">
        {/* User profile */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">User Profile</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Analyst Name</Label>
              <Input value={analyst} onChange={(e) => setAnalyst(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role / Designation</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Station / Unit</Label>
              <Input value={station} onChange={(e) => setStation(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* System preferences */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">System Preferences</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Toggle dark/light theme</div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Push Notifications</div>
                <div className="text-xs text-muted-foreground">Receive alerts for high-priority cases</div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Auto-Refresh Dashboard</div>
                <div className="text-xs text-muted-foreground">Periodically refresh intelligence data</div>
              </div>
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Display Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IST">IST (UTC+5:30)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Security & Access</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Authentication", value: "SSO / Role-Based Access", status: "Active" },
              { label: "Data Access Level", value: "Intelligence Analyst", status: "Active" },
              { label: "Session Timeout", value: "30 minutes", status: "Active" },
              { label: "Audit Logging", value: "Enabled", status: "Active" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.value}</div>
                </div>
                <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">{item.status}</Badge>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">Production deployment requires integration with the organization's SSO, RBAC, and audit trail systems.</p>
          </div>
        </Card>

        {/* Data & integrations */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Data & Integrations</h3>
          </div>
          <div className="space-y-3">
            {[
              { name: "Backend API", status: "Not Connected", note: "Required for production — live case data" },
              { name: "Crime Records Bureau", status: "Not Connected", note: "FIR registry and national crime database" },
              { name: "Mapping Service", status: "SVG Fallback", note: "Geographic visualization using built-in SVG" },
              { name: "AI / NLP Service", status: "Connected", note: "Sentiment analysis and AI-assisted classification" },
              { name: "Export / PDF Service", status: "Text Export", note: "Full PDF generation requires backend integration" },
            ].map((item) => (
              <div key={item.name} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/40 border">
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
                </div>
                <Badge variant="outline" className={`text-xs shrink-0 ${item.status === "Not Connected" ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-warning/10 text-warning border-warning/30"}`}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* About */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">About</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Application</span><span className="font-medium">NCIA Crime Intelligence Platform</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="font-mono">v2.0.0</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Build</span><span className="font-mono">React 18 · TypeScript · Vite · shadcn/ui</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Mode</span><Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">Operational</Badge></div>
          </div>
        </Card>

        <div className="flex justify-end pb-4">
          <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Save Settings</Button>
        </div>
      </div>
    </AppLayout>
  );
}
