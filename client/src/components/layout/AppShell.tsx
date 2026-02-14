import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  PlusCircle, 
  BarChart2, 
  Info, 
  Shield, 
  Search, 
  Menu,
  X,
  FileText,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { label: "Home", icon: LayoutDashboard, href: "/" },
    { label: "Create Poll", icon: PlusCircle, href: "/create" },
    { label: "Recent Rooms", icon: BarChart2, href: "/recent" }, // Placeholder route
  ];

  const secondaryNav = [
    { label: "About", icon: Info, href: "/about" },
    { label: "Privacy", icon: Shield, href: "/privacy" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border/50">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-indigo-500 mr-3 flex items-center justify-center text-white font-bold shadow-md">
            P
          </div>
          <span className="text-xl font-display font-bold tracking-tight">PollRoom</span>
        </div>

        <div className="flex flex-col h-[calc(100vh-4rem)] justify-between py-6 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    location === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>

          <nav className="space-y-1 mt-auto">
             <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               Support
             </div>
            {secondaryNav.map((item) => (
              <Link key={item.href} href={item.href}>
                <a 
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden sm:block max-w-md w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search polls..." 
                className="w-full h-9 pl-9 pr-4 rounded-full bg-secondary/50 border border-transparent focus:bg-background focus:border-ring/30 focus:ring-2 focus:ring-ring/20 transition-all text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
             <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-muted-foreground">
               <FileText className="h-4 w-4" />
               <span className="text-xs font-medium">Docs</span>
             </Button>
             <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-medium text-xs cursor-pointer hover:ring-2 hover:ring-offset-2 ring-primary/20 transition-all">
               ME
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
