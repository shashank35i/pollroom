import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, Loader2, Copy, ArrowRight, Share2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { api } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const pollSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters").max(140, "Question too long"),
  options: z.array(z.object({
    value: z.string().min(1, "Option cannot be empty").max(60, "Option too long")
  })).min(2, "At least 2 options required").max(6, "Max 6 options allowed")
    .refine((items) => new Set(items.map(i => i.value.toLowerCase())).size === items.length, {
      message: "Options must be unique",
    }),
});

type PollFormValues = z.infer<typeof pollSchema>;

export function CreatePollWidget({ fullWidth = false }: { fullWidth?: boolean }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [createdPoll, setCreatedPoll] = useState<{ pollId: string; shareUrl: string } | null>(null);

  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      question: "",
      options: [{ value: "" }, { value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const mutation = useMutation({
    mutationFn: (data: PollFormValues) => api.createPoll({
      question: data.question,
      options: data.options.map(o => o.value)
    }),
    onSuccess: (data) => {
      setCreatedPoll(data);
      toast({
        title: "Poll Created!",
        description: "Your poll is ready to share.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: PollFormValues) => {
    mutation.mutate(data);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Link copied to clipboard." });
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  if (createdPoll) {
    return (
      <Card className="border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Share2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display text-primary">Poll Ready!</CardTitle>
          <CardDescription>Share this link to start collecting votes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Share Link</Label>
            <div className="flex gap-2">
              <Input readOnly value={createdPoll.shareUrl} className="bg-white/50 border-primary/20 font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(createdPoll.shareUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" onClick={() => {
                const msg = `Hey! Join my poll: ${createdPoll.shareUrl}`;
                copyToClipboard(msg);
             }}>
               Copy Invite
             </Button>
             <Button className="btn-primary" onClick={() => setLocation(`/p/${createdPoll.pollId}`)}>
               Open Room <ArrowRight className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/60 shadow-sm transition-all hover:shadow-md", fullWidth ? "max-w-2xl mx-auto" : "")}>
      <CardHeader>
        <CardTitle className="font-display text-xl">Create a Poll</CardTitle>
        <CardDescription>Ask a question and get real-time answers.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input 
              id="question" 
              placeholder="What should we build next?" 
              {...form.register("question")}
              className={cn(form.formState.errors.question && "border-destructive focus-visible:ring-destructive")}
            />
            {form.formState.errors.question && (
              <p className="text-xs text-destructive">{form.formState.errors.question.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            <AnimatePresence initial={false}>
              {fields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2"
                >
                  <Input 
                    placeholder={`Option ${index + 1}`}
                    {...form.register(`options.${index}.value` as const)}
                    className={cn(form.formState.errors.options?.[index]?.value && "border-destructive")}
                  />
                  {fields.length > 2 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {form.formState.errors.options?.root && (
              <p className="text-xs text-destructive">{form.formState.errors.options.root.message}</p>
            )}
            
            {fields.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50"
                onClick={() => append({ value: "" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Option
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            type="submit" 
            className="w-full btn-primary" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Poll"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
