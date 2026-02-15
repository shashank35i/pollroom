import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Join() {
  const [, setLocation] = useLocation();
  const [joinId, setJoinId] = useState("");
  const { toast } = useToast();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = joinId.trim();
    if (!trimmed) return;

    try {
      let id = trimmed;
      if (trimmed.includes("/p/")) {
        id = trimmed.split("/p/")[1].split("/")[0].split("?")[0];
      } else if (trimmed.includes("/")) {
        id = trimmed.split("/").pop() || trimmed;
      }
      
      if (id.length < 2) throw new Error();
      setLocation(`/p/${id}`);
    } catch (err) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid Poll ID or Room URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold">Join a Poll Room</h1>
        <p className="text-muted-foreground">Enter a link or ID to start voting in real-time.</p>
      </div>

      <Card className="border-border/60 shadow-xl overflow-hidden relative rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-indigo-500" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
             <Search className="h-4 w-4 text-primary" /> Find Room
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="e.g. poll-id-xyz or https://.../p/xyz" 
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="h-12 px-4 text-sm font-mono rounded-xl"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground/70 flex items-center gap-1 px-1">
                <Info className="h-3 w-3" /> Supports full URLs or direct Poll IDs
              </p>
            </div>
            <Button type="submit" className="w-full h-12 btn-primary font-semibold rounded-xl">
              Join Room <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
