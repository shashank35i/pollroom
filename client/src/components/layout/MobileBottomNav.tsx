import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { navItems } from "./DesktopSidebar";

export function MobileBottomNav() {
  const [location] = useLocation();

  // Primary mobile items
  const mobileItems = navItems.filter(i => ["dashboard", "create", "join"].includes(i.key));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-t border-border/40 flex items-center justify-around md:hidden px-4 pb-[env(safe-area-inset-bottom)]">
      {mobileItems.map((item) => {
        const active = location === item.to;
        return (
          <Link
            key={item.key}
            href={item.to}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              active ? "text-primary font-semibold" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
