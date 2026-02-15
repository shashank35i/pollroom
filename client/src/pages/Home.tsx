import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BarChart2, CheckCircle2, Users, Radio, Database, ShieldCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatePollWidget } from "@/components/ui/CreatePollWidget";

export default function Home() {
  const [, setLocation] = useLocation();
  const [recentPolls, setRecentPolls] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent_polls");
      if (stored) {
        setRecentPolls(JSON.parse(stored).slice(0, 3));
      }
    } catch (e) {}
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-indigo-950 to-black text-white shadow-2xl p-8 md:p-12 border border-white/5">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge className="bg-primary/20 text-primary-foreground border-primary/20 backdrop-blur-sm">
              <Radio className="mr-1.5 h-3 w-3" /> Real-time: WebSocket
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-100 border-indigo-500/20 backdrop-blur-sm">
              <Database className="mr-1.5 h-3 w-3" /> Persistence: Server-backed
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-100 border-cyan-500/20 backdrop-blur-sm">
              <ShieldCheck className="mr-1.5 h-3 w-3" /> Fairness: Dual Controls
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight tracking-tight">
            Real-Time Poll Rooms
          </h1>
          <p className="text-indigo-100/70 text-lg mb-8 max-w-lg leading-relaxed">
            Instant, persistent, and secure. Gather live feedback with zero friction and robust voting fairness.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-95"
              onClick={() => document.getElementById("create-widget")?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Polling
            </Button>
            <Link href="/join">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 px-8 h-12 rounded-xl"
              >
                Join by ID
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6" id="create-widget">
          <h2 className="text-xl font-display font-bold text-foreground px-1">Create New Poll</h2>
          <CreatePollWidget />
        </div>

        <div className="space-y-6">
          <Card className="border-border/60 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-4 w-4 text-primary fill-primary" /> Live Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Demo uses the same Poll Room UI. Backend can provide a seeded pollId.
              </p>
              <Button className="w-full h-11 rounded-xl" variant="outline" onClick={() => setLocation('/p/demo')}>
                Open Demo Room
              </Button>
            </CardContent>
          </Card>

          {recentPolls.length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                 <CardTitle className="text-lg flex items-center gap-2">
                   <History className="h-4 w-4" /> Recent Rooms
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentPolls.map(id => (
                  <Link key={id} href={`/p/${id}`}>
                    <a className="block p-3 rounded-xl bg-secondary/30 hover:bg-secondary transition-all text-sm font-medium flex justify-between items-center group">
                      <span className="truncate font-mono text-xs text-muted-foreground/70">ID: {id}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-primary translate-x-[-4px] group-hover:translate-x-0" />
                    </a>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { History } from "lucide-react";
