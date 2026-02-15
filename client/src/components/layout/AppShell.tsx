import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Search, PanelLeftOpen, BarChart2, Radio, Database, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isCollapsed, toggleSidebar } = useSidebarState();

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

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      <DesktopSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out relative",
          !isCollapsed ? "md:pl-64" : "md:pl-0"
        )}
      >
        {isCollapsed && (
          <div className="fixed top-2 left-2 z-[60] hidden md:block">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5" 
                  onClick={toggleSidebar}
                >
                  <PanelLeftOpen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Open sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}

        <header className="sticky top-0 z-30 h-14 border-b border-black/[0.03] dark:border-white/[0.03] bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-full max-w-xl mx-auto sm:px-4">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Join by ID or Link..." 
                  className="w-full h-9 pl-9 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-1 focus:ring-primary/20 transition-all text-sm outline-none placeholder:text-muted-foreground/40"
                />
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

        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24 md:pb-12">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}

import { ReactNode } from "react";
