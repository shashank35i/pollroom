import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

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
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Desktop Sidebar */}
      <DesktopSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          "md:pl-[var(--sidebar-width)]"
        )}
        style={{ 
          "--sidebar-width": isCollapsed ? "64px" : "256px" 
        } as React.CSSProperties}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block max-w-md w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Poll ID to join..." 
                className="w-full h-9 pl-9 pr-4 rounded-full bg-secondary/50 border border-transparent focus:bg-background focus:border-ring/30 focus:ring-2 focus:ring-ring/20 transition-all text-sm outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <Link href="/profile">
               <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-medium text-xs cursor-pointer hover:ring-2 hover:ring-offset-2 ring-primary/20 transition-all">
                 ME
               </div>
             </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
