import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, BarChart2, Clock, Settings, LogOut, ChevronRight, Bell, Shield, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Profile() {
  const [recentPolls, setRecentPolls] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent_polls");
      if (stored) {
        setRecentPolls(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center gap-8 pb-10 border-b border-black/[0.05] dark:border-white/[0.05]">
        <div className="h-24 w-24 rounded-3xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-indigo-500/20 ring-4 ring-white dark:ring-white/5">
          ME
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-display font-bold tracking-tight">Anonymous User</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-semibold px-2">
              PRO
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">Managing your real-time poll sessions</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground/60">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Member since Feb 2026</span>
            <span className="flex items-center gap-1.5"><BarChart2 className="h-4 w-4" /> {recentPolls.length} polls tracked</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Recent History
            </h2>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View all</Button>
          </div>
          <div className="space-y-3">
            {recentPolls.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl border-black/[0.03] dark:border-white/[0.03] bg-black/[0.01] dark:bg-white/[0.01]">
                <BarChart2 className="h-10 w-10 mx-auto mb-4 opacity-20" />
                <p className="text-sm">No recent activity found.</p>
                <Link href="/create">
                   <Button variant="link" className="mt-2 text-primary">Create your first poll</Button>
                </Link>
              </div>
            ) : (
              recentPolls.map(id => (
                <Link key={id} href={`/p/${id}`}>
                  <a className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] hover:shadow-xl hover:shadow-black/[0.02] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-colors">
                        <BarChart2 className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <div className="font-semibold group-hover:text-primary transition-colors">Poll Room</div>
                        <div className="text-xs font-mono text-muted-foreground/60">{id}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </a>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold px-1 flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" /> Settings
            </h2>
            <div className="bg-white dark:bg-white/[0.02] border border-black/[0.03] dark:border-white/[0.03] rounded-3xl overflow-hidden divide-y divide-black/[0.03] dark:divide-white/[0.03]">
              <button className="w-full flex items-center justify-between p-5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Bell className="h-4 w-4" /></div>
                  <div className="text-sm font-medium">Notifications</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500"><Shield className="h-4 w-4" /></div>
                  <div className="text-sm font-medium">Privacy & Safety</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground transition-all" />
              </button>
              <button className="w-full flex items-center justify-between p-5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all group text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Key className="h-4 w-4" /></div>
                  <div className="text-sm font-medium">Connected Apps</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground transition-all" />
              </button>
            </div>
            
            <div className="pt-4">
              <Button variant="ghost" className="w-full justify-between h-14 px-5 rounded-2xl bg-destructive/[0.03] text-destructive hover:bg-destructive hover:text-white transition-all group">
                <span className="flex items-center gap-2 font-semibold"><LogOut className="h-5 w-5" /> Clear All Data</span>
                <ChevronRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-all" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import in previous turn
import { History } from "lucide-react";
