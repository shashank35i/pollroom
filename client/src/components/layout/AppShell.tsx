import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Radio, Database, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Badge } from "@/components/ui/badge";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isCollapsed, toggleSidebar } = useSidebarState();
  const isPublicPoll = location.startsWith("/p/");
  const [hasVisitedApp, setHasVisitedApp] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("ui.hasVisitedApp") === "true";
  });

  useEffect(() => {
    if (!isPublicPoll && !hasVisitedApp) {
      localStorage.setItem("ui.hasVisitedApp", "true");
      setHasVisitedApp(true);
    }
  }, [isPublicPoll, hasVisitedApp]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    
    let id = trimmed;
    if (trimmed.includes("/p/")) id = trimmed.split("/p/")[1].split("/")[0].split("?")[0];
    else if (trimmed.includes("/")) id = trimmed.split("/").pop() || trimmed;
    
    setLocation(`/p/${id}`);
    setSearchQuery("");
  };

  const sidebarWidth = isCollapsed ? "64px" : "280px";
  const showSidebar = !isPublicPoll || hasVisitedApp;

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/10 overflow-x-hidden"
      style={{ "--sidebar-w": sidebarWidth } as React.CSSProperties}
    >
      {showSidebar && (
        <DesktopSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      )}

      <div className={cn("flex-1 flex flex-col relative", showSidebar && "md:pl-[var(--sidebar-w)]")}>

        {showSidebar && (
          <header className="sticky top-0 z-30 h-14 border-b border-black/[0.03] dark:border-white/[0.03] bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-full max-w-xl mx-auto sm:px-4">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Join by ID or Link..." 
                    className={cn(
                      "w-full h-9 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-1 focus:ring-primary/20 transition-all text-sm outline-none placeholder:text-muted-foreground/40",
                      "pl-9 pr-12"
                    )}
                  />
                  {searchQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-10 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors flex items-center justify-center"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg border border-black/5 bg-white/80 text-muted-foreground shadow-sm transition-all dark:border-white/10 dark:bg-white/5",
                      "opacity-0 scale-95 pointer-events-none",
                      "group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:pointer-events-auto",
                      searchQuery.length > 0 && "opacity-100 scale-100 pointer-events-auto",
                    )}
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4 mx-auto" />
                  </button>
                </form>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3 pr-4">
               <Badge variant="outline" className="text-[10px] font-medium border-black/5 bg-black/[0.02] flex gap-1.5 items-center">
                 <Radio className="h-2.5 w-2.5 text-primary" /> WebSocket
               </Badge>
               <Badge variant="outline" className="text-[10px] font-medium border-black/5 bg-black/[0.02] flex gap-1.5 items-center">
                 <Database className="h-2.5 w-2.5 text-primary" /> Persistent
               </Badge>
            </div>
          </header>
        )}
        {!showSidebar && isPublicPoll && (
          <header className="sticky top-0 z-30 h-14 border-b border-black/[0.03] dark:border-white/[0.03] bg-background/80 backdrop-blur-xl px-4 flex items-center">
            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 flex items-center">
              <a
                href="/"
                className="font-display font-semibold text-sm tracking-tight text-foreground"
              >
                PollRoom
              </a>
            </div>
          </header>
        )}

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {showSidebar && <MobileBottomNav />}
    </div>
  );
}

import { ReactNode } from "react";
