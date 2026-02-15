import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { Search, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { isCollapsed, toggleSidebar } = useSidebarState();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/p/${searchQuery.trim()}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/10">
      {/* Desktop Sidebar */}
      <DesktopSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out relative",
          !isCollapsed ? "md:pl-64" : "md:pl-0"
        )}
      >
        {/* Floating Sidebar Toggle (ChatGPT Style) */}
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

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 border-b border-black/[0.03] dark:border-white/[0.03] bg-background/80 backdrop-blur-xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-full max-w-xl mx-auto sm:px-4">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Poll ID..." 
                  className="w-full h-9 pl-9 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-1 focus:ring-primary/20 transition-all text-sm outline-none placeholder:text-muted-foreground/40"
                />
              </form>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Link href="/profile">
               <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 border border-white/10 flex items-center justify-center text-white font-bold text-[10px] cursor-pointer hover:scale-105 transition-transform shadow-sm">
                 ME
               </div>
             </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
