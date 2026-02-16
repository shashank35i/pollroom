import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Loader2, Copy, ArrowRight, Share2, Check } from "lucide-react";
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
import { pollSchema, PollFormValues } from "@/validation/pollSchemas";

export function CreatePollWidget({ compact = false }: { compact?: boolean }) {
  const [, setLocation] = useLocation();
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
      localStorage.setItem("ui.hasVisitedApp", "true");
      toast({ title: "Created Successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Submission failed.", variant: "destructive" });
    }
  });

  const onSubmit = (data: PollFormValues) => mutation.mutate(data);

  const copy = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied" });
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
    toast({ title: "Copied" });
  };

  if (createdPoll) {
    return (
      <Card className="border-primary/20 bg-primary/[0.01] shadow-xl overflow-hidden relative rounded-3xl animate-in fade-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Check className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">Poll Created!</CardTitle>
          <CardDescription>Share with your audience instantly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Poll ID</Label>
            <div className="flex gap-2">
              <Input readOnly value={createdPoll.pollId} className="bg-white/50 border-black/5 font-mono text-sm h-11 rounded-xl" />
              <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl" onClick={() => copy(createdPoll.pollId)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="h-11 rounded-xl font-semibold" onClick={() => copy(`Join my poll: ${createdPoll.shareUrl}`)}>
               Copy Invite
             </Button>
             <Button className="btn-primary h-11 rounded-xl font-bold" onClick={() => setLocation(`/p/${createdPoll.pollId}`)}>
               Open Room
             </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/60 shadow-sm transition-all hover:shadow-md rounded-3xl", compact ? "" : "max-w-2xl mx-auto")}>
      <CardHeader>
        <CardTitle className="font-display font-bold text-xl">New Room</CardTitle>
        <CardDescription>Fill in the details to go live.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="question" className="text-xs font-bold uppercase text-muted-foreground/60 tracking-wider">Poll Question</Label>
            <Input 
              id="question" 
              placeholder="What should we build next?" 
              {...form.register("question")}
              className={cn("h-11 rounded-xl", form.formState.errors.question && "border-destructive")}
            />
            {form.formState.errors.question && (
              <p className="text-[10px] font-bold text-destructive">{form.formState.errors.question.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground/60 tracking-wider">Options</Label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input 
                    placeholder={`Option ${index + 1}`}
                    {...form.register(`options.${index}.value` as const)}
                    className={cn("h-11 rounded-xl", form.formState.errors.options?.[index]?.value && "border-destructive")}
                  />
                  {fields.length > 2 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => remove(index)}
                      className="h-11 w-11 rounded-xl hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {fields.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full h-10 border border-dashed border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
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
            className="w-full h-12 btn-primary rounded-2xl font-bold transition-all hover:scale-[1.01]" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Deploy Poll Room"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
