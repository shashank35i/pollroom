import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const navItems = [
  { key: "home", label: "Home", to: "/", icon: LayoutDashboard },
  { key: "create", label: "Create", to: "/create", icon: PlusCircle },
  { key: "profile", label: "Profile", to: "/profile", icon: User },
  { key: "settings", label: "Settings", to: "/privacy", icon: Settings },
];

interface DesktopSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function DesktopSidebar({ isCollapsed, toggleSidebar }: DesktopSidebarProps) {
  const [location] = useLocation();

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-[#F9F9F9] dark:bg-[#171717] transition-all duration-300 ease-in-out hidden md:flex flex-col border-r border-black/5 dark:border-white/5",
        isCollapsed ? "w-0 opacity-0 -translate-x-full" : "w-64 opacity-100 translate-x-0"
      )}
    >
      <div className="flex h-14 items-center px-4 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 text-token-text-secondary hover:bg-black/5 dark:hover:bg-white/5" 
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Close sidebar</TooltipContent>
        </Tooltip>
        <Link href="/">
          <a className="ml-2 font-display font-semibold text-sm tracking-tight">PollRoom</a>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = location === item.to;
            return (
              <Link key={item.key} href={item.to}>
                <a 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    active 
                      ? "bg-black/5 dark:bg-white/10 text-foreground" 
                      : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="truncate">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8">
           <div className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
             Recent Activity
           </div>
           <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left">
                <MessageSquare className="h-4 w-4" />
                <span className="truncate">Favorite Frameworks</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left">
                <History className="h-4 w-4" />
                <span className="truncate">Product Roadmap 2026</span>
              </button>
           </div>
        </div>
      </div>

      <div className="p-3 mt-auto">
        <Link href="/profile">
          <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all group">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
              ME
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">Anonymous</div>
            </div>
          </a>
        </Link>
      </div>
    </aside>
  );
}
