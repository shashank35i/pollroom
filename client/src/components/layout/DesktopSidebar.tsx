import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const navItems = [
  { key: "dashboard", label: "Dashboard", to: "/", icon: LayoutDashboard },
  { key: "create", label: "Create Poll", to: "/create", icon: PlusCircle },
  { key: "join", label: "Join Room", to: "/join", icon: Search },
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
        "fixed inset-y-0 left-0 z-50 bg-[#F3F5F7] dark:bg-[#141414] hidden md:flex flex-col border-r border-black/5 dark:border-white/5 transition-[width] duration-200 ease-in-out",
        isCollapsed ? "w-16" : "w-[280px]"
      )}
    >
      <div className={cn("h-14 shrink-0", isCollapsed ? "px-0" : "px-3")}>
        <div
          className={cn(
            "flex h-full items-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 font-display font-semibold text-sm tracking-tight text-foreground",
              isCollapsed ? "hidden" : "opacity-100 translate-x-0",
            )}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/5 text-[11px] font-semibold text-foreground/80 dark:bg-white/10 dark:text-white/80">
              PR
            </span>
            <span>PollRoom</span>
          </Link>
          {isCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-2", isCollapsed ? "px-0" : "px-3")}>
        {navItems.map((item) => {
          const active = location === item.to;
          return (
            <Link
              key={item.key}
              href={item.to}
              title={item.label}
              className={cn(
                "relative flex items-center text-sm font-medium transition-colors duration-200 group",
                isCollapsed
                  ? "mx-auto h-9 w-9 justify-center rounded-lg"
                  : "w-full gap-3 px-3 py-2.5 rounded-lg",
                active
                  ? isCollapsed
                    ? "bg-black/5 dark:bg-white/10 text-foreground"
                    : "bg-black/5 dark:bg-white/10 text-foreground"
                  : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground",
              )}
            >
              {!isCollapsed && active && (
                <span className="absolute left-0 h-6 w-1 rounded-full bg-primary" />
              )}
              <span className={cn("flex items-center justify-center", isCollapsed ? "h-9 w-9" : "h-5 w-5")}>
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
              </span>
              <span
                className={cn(
                  "truncate transition-all duration-200",
                  isCollapsed
                    ? "opacity-0 translate-x-2 max-w-0 pointer-events-none"
                    : "opacity-100 translate-x-0 max-w-[160px]",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
