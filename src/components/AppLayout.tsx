import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">

          {/* Glass header */}
          <header
            className="h-14 flex items-center gap-3 px-4 sticky top-0 z-30"
            style={{
              background: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(200, 215, 240, 0.60)",
              boxShadow: "0 4px 20px rgba(100, 130, 200, 0.10)",
            }}
          >
            <SidebarTrigger />
            <div className="h-5 w-px" style={{ background: "rgba(0,0,0,0.12)" }} />
            <div className="flex flex-col leading-tight">
              <h1 className="font-semibold text-foreground text-sm leading-none">{title}</h1>
              <span
                className="text-[10px] uppercase tracking-wider leading-none mt-0.5 font-medium"
                style={{ color: "hsl(217 91% 48%)" }}
              >
                NCIA Intelligence Platform
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Live indicator */}
              <div
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "hsl(142 65% 36%)" }}
              >
                <Activity className="h-3 w-3" />
                <span className="hidden md:inline">LIVE</span>
              </div>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases, calls, suspects..."
                  className="pl-8 w-72 h-9 text-sm"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(200,215,240,0.70)",
                    borderRadius: "0.6rem",
                  }}
                />
              </div>

              {/* Bell */}
              <button
                className="relative h-9 w-9 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(200,215,240,0.60)",
                }}
              >
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span
                  className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                  style={{ background: "hsl(0 72% 50%)" }}
                />
              </button>

              {/* User avatar */}
              <div
                className="flex items-center gap-2 pl-3"
                style={{ borderLeft: "1px solid rgba(0,0,0,0.10)" }}
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, hsl(217 91% 44%), hsl(217 91% 60%))",
                    boxShadow: "0 0 12px rgba(37,99,235,0.30)",
                  }}
                >
                  MJ
                </div>
                <div className="hidden lg:block text-xs leading-tight">
                  <div className="font-semibold text-foreground">Insp. Meera Joshi</div>
                  <div className="text-muted-foreground">Intelligence Analyst</div>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
