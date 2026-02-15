import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, AlertTriangle, Terminal } from "lucide-react";

export default function Notes() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-display font-bold tracking-tight">Assignment Notes</h1>
        <p className="text-muted-foreground text-lg">System architecture, fairness controls, and implementation details.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/60 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Fairness Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold">1. Stable Anonymous Client ID</p>
              <p className="text-muted-foreground">Every request includes a unique <code className="bg-muted px-1 rounded">X-Client-Id</code> header generated once per browser. The backend uses this to enforce a one-vote-per-poll rule.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">2. Server-Side Rate Limiting</p>
              <p className="text-muted-foreground">Backend enforces IP-based rate limiting. When a 429 error is returned, the UI displays a cooldown message and disables the voting button.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" /> Real-Time Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold">WebSocket (Socket.IO)</p>
              <p className="text-muted-foreground">On joining a room, the client connects to a socket singleton and emits <code className="bg-muted px-1 rounded">poll:join</code>. Real-time state updates are pushed via <code className="bg-muted px-1 rounded">poll:state</code>.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Hybrid Sync</p>
              <p className="text-muted-foreground">Initial state is fetched via REST for speed and SEO, then upgraded to WebSocket for live interactivity.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 rounded-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" /> Edge Cases & Limitations
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
          <ul className="space-y-2 list-disc pl-4 text-muted-foreground">
            <li><strong>Invalid pollId:</strong> Handled via robust 404 catch-all UI.</li>
            <li><strong>Already Voted:</strong> 403 response triggers UI lock with "Vote recorded" banner.</li>
          </ul>
          <ul className="space-y-2 list-disc pl-4 text-muted-foreground">
            <li><strong>Identity Bypass:</strong> Incognito mode or clearing storage generates a new Client ID.</li>
            <li><strong>Bot Protection:</strong> Basic protection is implemented; advanced bot mitigation would require Captcha/Auth.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <Terminal className="h-5 w-5 text-primary" />
        <p className="text-sm font-medium">This frontend is production-ready with clear REST + Socket.IO contracts for backend integration.</p>
      </div>
    </div>
  );
}
