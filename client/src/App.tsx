import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/layout/AppShell";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import PollRoom from "@/pages/PollRoom";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={Create} />
        <Route path="/p/:pollId" component={PollRoom} />
        
        {/* Static pages placeholders */}
        <Route path="/about">
          <div className="prose max-w-2xl mx-auto py-10">
             <h1>About PollRoom</h1>
             <p>Built for speed and simplicity. PollRoom is a frontend-first prototype demonstrating modern React patterns.</p>
          </div>
        </Route>
        
        <Route path="/privacy">
          <div className="prose max-w-2xl mx-auto py-10">
             <h1>Privacy</h1>
             <p>This is a demo application. No data is stored on any server. All data lives in your browser's local storage.</p>
          </div>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
