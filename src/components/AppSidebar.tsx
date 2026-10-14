import { Shield } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  MapPin,
  GitBranch,
  Navigation,
  FileBarChart2,
  Archive,
  Settings,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const primaryItems = [
  { title: "Intelligence Overview", url: "/", icon: LayoutDashboard },
  { title: "FIR & Cases", url: "/fir", icon: FileText },
  { title: "Calls & Emails", url: "/communications", icon: MessageSquare },
  { title: "Sentiment Analysis", url: "/sentiment", icon: Brain },
  { title: "Crime Hotspots", url: "/hotspots", icon: MapPin },
  { title: "Repeat Patterns", url: "/patterns", icon: GitBranch },
  { title: "Patrol Planning", url: "/patrol", icon: Navigation },
  { title: "Daily Reports", url: "/daily-report", icon: FileBarChart2 },
  { title: "Recovered Items", url: "/recovered", icon: Archive },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border"
      style={{
        background: "linear-gradient(180deg, hsl(222 55% 4%) 0%, hsl(220 52% 6%) 100%)",
      }}
    >
      <SidebarHeader
        className="border-b border-sidebar-border"
        style={{ borderBottomColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3 px-2 py-3">
          {/* Logo badge */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, hsl(43 92% 50%), hsl(36 95% 60%))",
              boxShadow: "0 4px 16px rgba(245, 166, 35, 0.35)",
            }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span
                className="text-sm font-black tracking-tight"
                style={{
                  background: "linear-gradient(135deg, hsl(43 92% 65%), hsl(36 95% 72%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                NCIA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/55">
                Crime Intelligence
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-[10px] tracking-widest uppercase px-4 pt-4 pb-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Intelligence Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-2 gap-0.5">
              {primaryItems.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      style={
                        active
                          ? {
                              background: "rgba(59, 130, 246, 0.16)",
                              color: "hsl(217 91% 72%)",
                              borderLeft: "2px solid hsl(217 91% 65%)",
                              borderRadius: "0.5rem",
                              boxShadow: "inset 0 0 20px rgba(59,130,246,0.08)",
                              fontWeight: 600,
                            }
                          : {
                              color: "rgba(255,255,255,0.65)",
                              borderLeft: "2px solid transparent",
                              borderRadius: "0.5rem",
                            }
                      }
                      className={
                        active
                          ? ""
                          : "hover:bg-white/5 hover:text-sidebar-accent-foreground transition-colors"
                      }
                    >
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter
        className="border-t"
        style={{ borderTopColor: "rgba(255,255,255,0.07)" }}
      >
        {!collapsed && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              <div
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: "hsl(142 68% 45%)" }}
              />
              <span className="font-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>Active</span>
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>
              NCIA Intelligence Platform · v2.0 ·
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
