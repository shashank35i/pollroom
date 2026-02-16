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
              <p className="font-semibold">1. One vote per poll per clientId</p>
              <p className="text-muted-foreground">Backend enforces <code className="bg-muted px-1 rounded">UNIQUE(poll_id, client_id)</code>. Each browser sends a stable <code className="bg-muted px-1 rounded">X-Client-Id</code> so a client can vote only once per poll.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">2. IP + poll rate limiting</p>
              <p className="text-muted-foreground">Server applies IP + poll rate limits to mitigate spam bursts. 429 responses show a cooldown banner with retry time.</p>
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
              <p className="text-muted-foreground">Clients emit <code className="bg-muted px-1 rounded">poll:join</code> and receive <code className="bg-muted px-1 rounded">poll:state</code> for live updates.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Realtime fallback</p>
              <p className="text-muted-foreground">If sockets drop, the UI shows a reconnect banner and the Refresh button pulls REST state as fallback.</p>
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
            <li><strong>Invalid pollId:</strong> Clean 404 UI with return to dashboard.</li>
            <li><strong>Already voted:</strong> 403 locks voting but results continue to update.</li>
          </ul>
          <ul className="space-y-2 list-disc pl-4 text-muted-foreground">
            <li><strong>Identity bypass:</strong> Incognito/new device produces a new clientId.</li>
            <li><strong>Shared IP throttling:</strong> Rate limiting can affect shared networks.</li>
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
