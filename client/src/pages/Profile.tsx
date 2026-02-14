import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, BarChart2, Clock, Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function Profile() {
  const [recentPolls, setRecentPolls] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recent_polls");
      if (stored) {
        setRecentPolls(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6 pb-6 border-b border-border/50">
        <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          ME
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Anonymous Creator</h1>
          <p className="text-muted-foreground">Managing your temporary poll session</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
              Free Tier
            </Badge>
            <Badge variant="secondary">
              {recentPolls.length} Polls Visited
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Recent Activity
            </CardTitle>
            <CardDescription>Polls you've visited or created recently.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPolls.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground border border-dashed rounded-xl border-border">
                No recent activity found.
              </div>
            ) : (
              recentPolls.map(id => (
                <Link key={id} href={`/p/${id}`}>
                  <a className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border">
                        <BarChart2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Poll Room</div>
                        <div className="text-xs font-mono text-muted-foreground">{id}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </Button>
                  </a>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-sm" disabled>
                Account Details
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm" disabled>
                Notification Preferences
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sm text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" /> Clear Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
