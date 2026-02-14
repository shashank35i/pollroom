import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Copy, Check, Users, Clock, AlertCircle, RefreshCcw, Lock, BarChart2 } from "lucide-react";

import { api } from "@/api/client";
import { socket } from "@/sockets/socket";
import { Poll, PollOption } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function PollRoom() {
  const [match, params] = useRoute("/p/:pollId");
  const pollId = params?.pollId || "";
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Mock default true

  // Load vote state from local storage
  useEffect(() => {
    const voted = localStorage.getItem(`voted:${pollId}`);
    if (voted) {
      setHasVoted(true);
      setSelectedOption(voted);
    }
    
    // Save to recent
    if (pollId) {
      const recent = JSON.parse(localStorage.getItem("recent_polls") || "[]");
      if (!recent.includes(pollId)) {
        localStorage.setItem("recent_polls", JSON.stringify([pollId, ...recent].slice(0, 5)));
      }
    }
  }, [pollId]);

  // Socket connection
  useEffect(() => {
    socket.connect();
    socket.emit("poll:join", { pollId });
    
    const onState = (data: any) => {
      // Optimistically update the query cache
      queryClient.setQueryData(["poll", pollId], (old: Poll | undefined) => {
        if (!old) return old;
        return { ...old, results: data.results, totalVotes: data.totalVotes };
      });
    };
    
    socket.on("poll:state", onState);
    
    return () => {
      socket.off("poll:state", onState);
      socket.disconnect();
    };
  }, [pollId, queryClient]);

  const { data: poll, isLoading, isError, refetch } = useQuery({
    queryKey: ["poll", pollId],
    queryFn: () => api.getPoll(pollId),
    retry: false,
  });

  const voteMutation = useMutation({
    mutationFn: (optionId: string) => api.vote(pollId, optionId),
    onSuccess: (_, optionId) => {
      setHasVoted(true);
      localStorage.setItem(`voted:${pollId}`, optionId);
      toast({ title: "Vote Recorded", description: "Thanks for voting!" });
    },
    onError: (err) => {
      toast({ title: "Error", description: "Failed to submit vote.", variant: "destructive" });
    }
  });

  const handleVote = () => {
    if (selectedOption) {
      voteMutation.mutate(selectedOption);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Copied!", description: "Poll link copied to clipboard." });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !poll) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold font-display mb-2">Poll Not Found</h1>
        <p className="text-muted-foreground mb-6">This poll doesn't exist or has been deleted.</p>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="border-border/60 shadow-md overflow-hidden">
        <div className="bg-secondary/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-background text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Room: {poll.pollId}
              </Badge>
              <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-500/20 shadow-none">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                Live
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {poll.question}
            </h1>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" onClick={() => refetch()}>
               <RefreshCcw className="h-4 w-4" />
             </Button>
             <Button variant="secondary" size="sm" onClick={copyLink}>
               <Share2 className="mr-2 h-4 w-4" /> Share
             </Button>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Voting Section */}
        <Card className="border-border/60 shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Cast your vote
              {hasVoted && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
            <CardDescription>Select one option below.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {hasVoted ? (
               <div className="p-4 bg-muted/30 rounded-lg border border-border/50 text-center py-8">
                 <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                 <h3 className="font-semibold text-lg">You've voted!</h3>
                 <p className="text-muted-foreground text-sm">See the results update in real-time.</p>
               </div>
            ) : (
              poll.options.map((option) => (
                <div 
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={`
                    p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between
                    ${selectedOption === option.id 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm" 
                      : "border-border/50 hover:border-primary/50 hover:bg-secondary/50"}
                  `}
                >
                  <span className="font-medium text-sm">{option.text}</span>
                  {selectedOption === option.id && (
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="pt-2">
             {!hasVoted && (
                <Button 
                  className="w-full btn-primary" 
                  size="lg"
                  disabled={!selectedOption || voteMutation.isPending}
                  onClick={handleVote}
                >
                  {voteMutation.isPending ? "Submitting..." : "Submit Vote"}
                </Button>
             )}
          </CardFooter>
        </Card>

        {/* Results Section */}
        <Card className="border-border/60 shadow-sm h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Live Results</span>
              <span className="text-sm font-normal text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-full">
                <Users className="h-3 w-3" /> {poll.totalVotes}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {poll.totalVotes === 0 ? (
              <div className="text-center py-10 opacity-60">
                <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground">No votes yet. Be the first!</p>
              </div>
            ) : (
              poll.options.map((option) => {
                const result = poll.results.find(r => r.optionId === option.id);
                const votes = result?.votes || 0;
                const percentage = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;
                const isWinner = Math.max(...poll.results.map(r => r.votes)) === votes && votes > 0;

                return (
                  <div key={option.id} className="space-y-2 group">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={isWinner ? "font-bold text-primary" : "font-medium"}>
                        {option.text}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {percentage}% ({votes})
                      </span>
                    </div>
                    <div className="relative h-3 w-full bg-secondary/50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${percentage}%` }}
                         transition={{ type: "spring", stiffness: 50, damping: 15 }}
                         className={`h-full rounded-full ${isWinner ? 'bg-linear-to-r from-primary to-indigo-400' : 'bg-muted-foreground/30'}`}
                       />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
