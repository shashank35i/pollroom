import { CreatePollWidget } from "@/components/ui/CreatePollWidget";

export default function Create() {
  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="mb-10 text-center space-y-2">
        <h1 className="text-4xl font-display font-bold tracking-tight">Create Poll</h1>
        <p className="text-muted-foreground text-lg">Deploy a new room with real-time sync.</p>
      </div>
      
      <CreatePollWidget />

      <div className="mt-16 grid md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-widest text-primary">01. Dynamic</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">WebSocket integration ensures every vote is reflected across all clients instantly.</p>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-widest text-primary">02. Verified</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Dual-layer fairness controls prevent duplicate voting through anonymous client tracking.</p>
        </div>
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-widest text-primary">03. Persistent</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Rooms are server-backed, ensuring your results remain accessible and stable.</p>
        </div>
      </div>
    </div>
  );
}
