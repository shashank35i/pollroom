import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/layout/AppShell";
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import PollRoom from "@/pages/PollRoom";
import Join from "@/pages/Join";
import Notes from "@/pages/Notes";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={Create} />
        <Route path="/join" component={Join} />
        <Route path="/p/:pollId" component={PollRoom} />
        <Route path="/notes" component={Notes} />
        <Route path="/recent">
          <Redirect to="/" />
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
