import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b bg-card px-4 sticky top-0 z-30 backdrop-blur-md bg-card/95">
            <SidebarTrigger />
            <div className="h-5 w-px bg-border" />
            <h1 className="font-semibold text-foreground text-base">{title}</h1>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search FIR, PCR, accused..." className="pl-8 w-72 h-9" />
              </div>
              <button className="relative h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
              </button>
              <div className="flex items-center gap-2 pl-3 border-l">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  RK
                </div>
                <div className="hidden lg:block text-xs leading-tight">
                  <div className="font-semibold">Insp. R. Kumar</div>
                  <div className="text-muted-foreground">Duty Officer</div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
