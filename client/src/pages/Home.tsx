import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, BarChart2, CheckCircle2, Users, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatePollWidget } from "@/components/ui/CreatePollWidget";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [joinId, setJoinId] = useState("");
  const [recentPolls, setRecentPolls] = useState<string[]>([]);

  useEffect(() => {
    // Basic recent polls implementation
    try {
      const stored = localStorage.getItem("recent_polls");
      if (stored) {
        setRecentPolls(JSON.parse(stored).slice(0, 3));
      }
    } catch (e) {}
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinId.trim()) return;
    // Simple parsing logic: if url, extract last segment, else use raw
    const id = joinId.split('/').pop() || joinId;
    setLocation(`/p/${id}`);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 to-violet-900 text-white shadow-xl p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-cyan-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <Badge variant="secondary" className="mb-4 bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-sm">
            <Zap className="mr-1 h-3 w-3 text-yellow-300" /> Real-time Beta
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 leading-tight">
            Create, share, vote.<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 to-indigo-300">
              Results update instantly.
            </span>
          </h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-lg">
            The fastest way to gather feedback. No signup required. 
            Simply create a room, share the link, and watch votes roll in live.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold border-0"
              onClick={() => document.getElementById("create-widget")?.scrollIntoView({ behavior: 'smooth' })}
            >
              Create Poll
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => document.getElementById("join-card")?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Room
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold font-display">0ms</div>
              <div className="text-sm text-indigo-200">Latency</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold font-display">100%</div>
              <div className="text-sm text-indigo-200">Free</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold font-display">∞</div>
              <div className="text-sm text-indigo-200">Polls</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Create */}
        <div className="lg:col-span-2 space-y-6" id="create-widget">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-foreground">Start a new poll</h2>
          </div>
          <CreatePollWidget />
        </div>

        {/* Right Column - Join & Info */}
        <div className="space-y-6">
          <Card id="join-card" className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Join a Poll</CardTitle>
              <CardDescription>Enter a code or link to join.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoin} className="flex gap-2">
                <Input 
                  placeholder="poll-id-xyz" 
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button type="submit" variant="secondary">Join</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/50 to-background border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="h-4 w-4 text-primary fill-primary" /> Try a Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                See how it works with a pre-populated live poll room.
              </p>
              <Button className="w-full" variant="outline" onClick={() => setLocation('/p/demo')}>
                Open Demo Room
              </Button>
            </CardContent>
          </Card>

          {recentPolls.length > 0 && (
            <Card className="border-border/60">
              <CardHeader>
                 <CardTitle className="text-lg">Recent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentPolls.map(id => (
                  <Link key={id} href={`/p/${id}`}>
                    <a className="block p-3 rounded-lg bg-secondary/30 hover:bg-secondary transition-colors text-sm font-medium flex justify-between items-center group">
                      <span className="truncate font-mono text-xs text-muted-foreground">ID: {id}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
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
