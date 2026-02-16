import { useState, useEffect, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Check, Users, AlertCircle, RefreshCcw, Lock, BarChart2, Radio, Copy, ArrowLeft } from "lucide-react";

import { api } from "@/api/client";
import { socket } from "@/sockets/socket";
import { Poll } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getVoted, setVoted } from "@/utils/clientId";
import { cn } from "@/lib/utils";

export default function PollRoom() {
  const [, params] = useRoute("/p/:pollId");
  const pollId = params?.pollId || "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const hasVisitedApp =
    typeof window !== "undefined" &&
    localStorage.getItem("ui.hasVisitedApp") === "true";
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [status, setStatus] = useState<"LIVE" | "RECONNECTING" | "OFFLINE">("LIVE");
  const [voteBanner, setVoteBanner] = useState<null | { type: "already" | "rate" | "network"; retryAfterSeconds?: number }>(null);
  const [lastDisconnectAt, setLastDisconnectAt] = useState<number | null>(null);

  useEffect(() => {
    const voted = getVoted(pollId);
    if (voted) {
      setSelectedOption(voted);
    }
    
    // Save to recent
    if (pollId && pollId !== "demo") {
      const recent = JSON.parse(localStorage.getItem("recent_polls") || "[]");
      if (!recent.includes(pollId)) {
        localStorage.setItem("recent_polls", JSON.stringify([pollId, ...recent].slice(0, 8)));
      }
    }
  }, [pollId]);

  useEffect(() => {
    if (!pollId) return;
    socket.connect();
    socket.emit("poll:join", { pollId });
    
    const onState = (data: any) => {
      queryClient.setQueryData(["poll", pollId], (old: Poll | undefined) => {
        if (!old) return old;
        return { ...old, results: data.results, totalVotes: data.totalVotes };
      });
    };
    const onSocketError = (data: { message?: string }) => {
      if (data?.message) {
        toast({ title: "Room Error", description: data.message, variant: "destructive" });
      }
    };
    const onConnect = () => {
      setStatus("LIVE");
      setLastDisconnectAt(null);
    };
    const onDisconnect = () => {
      setStatus("RECONNECTING");
      setLastDisconnectAt(Date.now());
    };
    const onReconnectAttempt = () => {
      setStatus("RECONNECTING");
      if (!lastDisconnectAt) {
        setLastDisconnectAt(Date.now());
      }
    };
    const onConnectError = () => {
      setStatus("RECONNECTING");
      if (!lastDisconnectAt) {
        setLastDisconnectAt(Date.now());
      }
    };
    
    socket.on("poll:state", onState);
    socket.on("poll:error", onSocketError);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect_attempt", onReconnectAttempt);
    socket.on("connect_error", onConnectError);
    
    return () => {
      socket.off("poll:state", onState);
      socket.off("poll:error", onSocketError);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [pollId, queryClient, toast, lastDisconnectAt]);

  useEffect(() => {
    if (status !== "RECONNECTING") return;
    const timeout = setTimeout(() => {
      if (status === "RECONNECTING") {
        setStatus("OFFLINE");
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [status]);

  const { data: poll, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: () => api.getPoll(pollId),
    retry: false,
  });

  useEffect(() => {
    if (!poll) return;
    if (poll.userStatus) {
      setHasVoted(poll.userStatus.hasVoted);
      if (poll.userStatus.votedOptionId) {
        setSelectedOption(poll.userStatus.votedOptionId);
      }
    } else {
      const voted = getVoted(pollId);
      setHasVoted(Boolean(voted));
    }
  }, [poll, pollId]);

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => api.vote(pollId, optionId),
    onSuccess: (updatedPoll, optionId) => {
      setHasVoted(true);
      setVoted(pollId, optionId);
      queryClient.setQueryData(["poll", pollId], updatedPoll);
      setVoteBanner(null);
      toast({ title: "Vote Recorded", description: "Thanks for your feedback!" });
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const retryAfterSeconds =
        err?.response?.data?.retryAfterSeconds ||
        (err?.response?.headers?.["retry-after"]
          ? Number(err.response.headers["retry-after"])
          : undefined);
      if (status === 403) {
        setHasVoted(true);
        refetch();
        setVoteBanner({ type: "already" });
        toast({ title: "Already Voted", description: "Your vote has already been recorded on the server.", variant: "destructive" });
      } else if (status === 429) {
        setVoteBanner({ type: "rate", retryAfterSeconds });
        toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
      } else {
        setVoteBanner({ type: "network" });
        toast({ title: "Error", description: "Failed to submit vote.", variant: "destructive" });
      }
    }
  });

  const handleVote = () => {
    if (selectedOption && !hasVoted) {
      voteMutation.mutate(selectedOption);
    }
  };

  const shareUrl = useMemo(() => {
    if (poll?.shareUrl) return poll.shareUrl;
    if (pollId) return `${window.location.origin}/p/${pollId}`;
    return window.location.href;
  }, [poll?.shareUrl, pollId]);

  const copyText = async (text: string, message: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      toast({ title: message });
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    toast({ title: message });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !poll) {
    const status = (error as any)?.response?.status;
    if (status && status !== 404) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-2">Network Error</h1>
          <p className="text-muted-foreground mb-8">We couldn't load this poll. Please try again.</p>
          <Button onClick={() => refetch()} className="h-11 px-8 rounded-xl">Retry</Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h1 className="text-3xl font-bold font-display mb-2">Poll Not Found</h1>
        <p className="text-muted-foreground mb-8">This poll doesn't exist or the ID is incorrect.</p>
        <Button onClick={() => setLocation("/")} className="h-11 px-8 rounded-xl">Go to Dashboard</Button>
      </div>
    );
  }

  const options = poll?.options ?? [];
  const results = poll?.results ?? [];
  const totalVotes = poll?.totalVotes ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <Card className="border-border/60 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {hasVisitedApp && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() =>
                    window.history.length > 1 ? window.history.back() : setLocation("/")
                  }
                  aria-label="Go back"
                  title="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <Badge variant="secondary" className="bg-black/5 dark:bg-white/5 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border-none">
                ID: {poll.pollId}
              </Badge>
              <Badge className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-none",
                status === "LIVE" ? "bg-green-500/10 text-green-600" : 
                status === "RECONNECTING" ? "bg-yellow-500/10 text-yellow-600 animate-pulse" :
                "bg-red-500/10 text-red-600"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", status === "LIVE" ? "bg-green-500 animate-pulse" : status === "RECONNECTING" ? "bg-yellow-500" : "bg-red-500")}></span>
                {status}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
              {poll.question}
            </h1>
          </div>
          <div className="flex gap-2 shrink-0">
             <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={() => refetch()} aria-label="Refresh results">
               {isFetching ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
             </Button>
             <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={() => copyText(poll.pollId, "Poll ID copied")} aria-label="Copy poll ID">
               <Copy className="h-4 w-4" />
             </Button>
             <Button variant="secondary" className="h-11 px-6 rounded-xl font-semibold" onClick={() => copyText(shareUrl, "Link copied")} aria-label="Copy share link">
               <Share2 className="mr-2 h-4 w-4" /> Share
             </Button>
          </div>
        </div>
        {status !== "LIVE" && (
          <div className="px-6 md:px-8 pb-4">
            <div className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
              {status === "RECONNECTING"
                ? "Reconnecting… live updates will resume shortly"
                : "Offline — showing last known results. Click Refresh to retry."}
            </div>
          </div>
        )}
        {voteBanner?.type === "already" && (
          <div className="px-6 md:px-8 pb-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              Already voted — results will continue to update live.
            </div>
          </div>
        )}
        {voteBanner?.type === "rate" && (
          <div className="px-6 md:px-8 pb-4">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm">
              Too many requests. {voteBanner.retryAfterSeconds ? `Try again in ${voteBanner.retryAfterSeconds}s.` : "Please wait a moment."}
            </div>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-border/60 shadow-md h-full flex flex-col rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Cast Vote
              {hasVoted && <Lock className="h-4 w-4 text-muted-foreground/40" />}
            </CardTitle>
            <CardDescription>Select your choice to update results.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 pt-2">
            {hasVoted ? (
               <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center py-12">
                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                   <Check className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="font-bold text-xl mb-1">Vote Recorded</h3>
                 <p className="text-muted-foreground text-sm">You voted: {poll.options.find(o => o.id === selectedOption)?.text || "—"}</p>
               </div>
            ) : (
              options.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between group",
                    selectedOption === option.id 
                      ? "border-primary bg-primary/[0.03] shadow-inner" 
                      : "border-black/[0.04] dark:border-white/[0.04] hover:border-primary/30 hover:bg-secondary/30"
                  )}
                >
                  <span className={cn("font-medium text-sm transition-colors", selectedOption === option.id ? "text-primary" : "group-hover:text-foreground")}>
                    {option.text}
                  </span>
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2 transition-all flex items-center justify-center",
                    selectedOption === option.id ? "border-primary bg-primary" : "border-black/10 dark:border-white/10"
                  )}>
                    {selectedOption === option.id && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              ))
            )}
          </CardContent>
          {!hasVoted && (
            <CardFooter className="pt-2">
              <Button 
                className="w-full h-12 btn-primary rounded-2xl font-bold" 
                disabled={!selectedOption || voteMutation.isPending}
                onClick={handleVote}
              >
                {voteMutation.isPending ? "Submitting..." : "Submit Response"}
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card className="border-border/60 shadow-md h-full rounded-3xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Results</span>
              <Badge variant="secondary" className="bg-black/5 dark:bg-white/5 font-mono text-xs">
                <Users className="h-3 w-3 mr-1.5" /> {totalVotes} votes
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {totalVotes === 0 ? (
              <div className="text-center py-20 bg-black/[0.01] dark:bg-white/[0.01] rounded-3xl border border-dashed border-border/50">
                <BarChart2 className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground/60">Waiting for first response...</p>
              </div>
            ) : (
              options.map((option) => {
                const result = results.find(r => r.optionId === option.id);
                const votes = result?.votes || 0;
                const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                const maxVotes = results.length > 0 ? Math.max(...results.map(r => r.votes)) : 0;
                const isWinner = maxVotes === votes && votes > 0;

                return (
                  <div key={option.id} className="space-y-2.5">
                    <div className="flex justify-between text-sm mb-1 px-1">
                      <span className={cn("font-medium transition-colors", isWinner ? "text-primary font-bold" : "text-muted-foreground")}>
                        {option.text}
                      </span>
                      <span className="text-muted-foreground tabular-nums text-xs">
                        {percentage}% <span className="mx-1 opacity-30">•</span> {votes}
                      </span>
                    </div>
                    <div className="relative h-2.5 w-full bg-black/[0.03] dark:bg-white/[0.03] rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         transition={{ type: "spring", stiffness: 40, damping: 12 }}
                         className={cn("h-full rounded-full transition-colors", isWinner ? 'bg-primary' : 'bg-muted-foreground/20')}
                       />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-6 opacity-40">
             <p className="text-[10px] text-center w-full flex items-center justify-center gap-1.5 uppercase tracking-widest font-bold">
               <Radio className="h-2.5 w-2.5" /> Live sync active
             </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
