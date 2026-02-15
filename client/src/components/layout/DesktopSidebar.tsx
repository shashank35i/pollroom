import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  History,
  FileText,
  PanelLeftClose
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const navItems = [
  { key: "dashboard", label: "Dashboard", to: "/", icon: LayoutDashboard },
  { key: "create", label: "Create Poll", to: "/create", icon: PlusCircle },
  { key: "join", label: "Join Room", to: "/join", icon: Search },
  { key: "recent", label: "Recent Rooms", to: "/recent", icon: History },
  { key: "notes", label: "Notes", to: "/notes", icon: FileText },
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
              className="h-10 w-10 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5" 
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

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const active = location === item.to;
          return (
            <Link key={item.key} href={item.to}>
              <a 
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                  active 
                    ? "bg-black/5 dark:bg-white/10 text-foreground font-semibold" 
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="truncate">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
