import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusCircle, 
  User, 
  Search, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
        "fixed inset-y-0 left-0 z-50 border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out hidden md:flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center px-4 border-b border-sidebar-border/50 overflow-hidden shrink-0">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shrink-0">
          P
        </div>
        {!isCollapsed && (
          <span className="ml-3 text-xl font-display font-bold tracking-tight truncate">PollRoom</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("ml-auto", isCollapsed && "mx-auto")} 
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location === item.to;
          return (
            <Link key={item.key} href={item.to}>
              <a 
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  active 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "group-hover:text-foreground")} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
