import { CreatePollWidget } from "@/components/ui/CreatePollWidget";

export default function Create() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-display font-bold mb-3">Create a Public Poll</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Set up your question and options below. Your poll will be live instantly and you'll get a unique link to share with your audience.
        </p>
      </div>
      
      <CreatePollWidget fullWidth />

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
            Instant & Live
          </h3>
          <p className="text-sm text-muted-foreground">Updates are pushed via WebSockets in real-time. No page refreshing needed.</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
            Fair Voting
          </h3>
          <p className="text-sm text-muted-foreground">We use browser fingerprinting and local storage to prevent double voting.</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/20 border border-border/50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
            Mobile Ready
          </h3>
          <p className="text-sm text-muted-foreground">Optimized for all devices. Share via QR code or direct link easily.</p>
        </div>
      </div>
    </div>
  );
}
