import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { FeatureHeader } from "@/components/FeatureHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — ProdAI" },
      { name: "description", content: "Prioritized daily or weekly plans with time optimization." },
    ],
  }),
  component: PlannerPage,
});

const priorityColor: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-accent/25 text-accent-foreground",
  low: "bg-primary/10 text-primary",
};

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<"day" | "week">("day");
  const [hours, setHours] = useState(8);
  const [priorities, setPriorities] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { tasks, horizon, workHoursPerDay: hours, priorities } }),
    onSuccess: (res) => { if (!res.ok) toast.error(res.error); },
    onError: (e) => toast.error(e.message),
  });
  const result = mutation.data?.ok ? mutation.data.data : null;

  return (
    <AppShell>
      <FeatureHeader
        title="AI Task Planner"
        description="Describe your tasks. Get a prioritized time-blocked plan and tips for optimizing your day or week."
      />
      <div className="mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-5 gap-6">
        <form className="lg:col-span-2 space-y-4 rounded-xl bg-card border border-border p-5"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
          <div>
            <Label htmlFor="tasks">Tasks (one per line)</Label>
            <Textarea id="tasks" rows={8} value={tasks} onChange={(e) => setTasks(e.target.value)} required minLength={5}
              placeholder={"Prepare board deck\nReview 3 PR pull requests\nCall Priya about API limits\n1:1 with Sam"} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Horizon</Label>
              <Select value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="h">Hours/day</Label>
              <Input id="h" type="number" min={1} max={16} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label htmlFor="pri">Priorities (optional)</Label>
            <Input id="pri" value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder="Ship board deck by end of day" />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Build plan
          </Button>
        </form>

        <div className="lg:col-span-3 space-y-4">
          {mutation.isPending && <div className="rounded-xl border border-border bg-card p-6 animate-pulse text-muted-foreground">Planning…</div>}
          {result && (
            <>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg mb-2">Overview</h3>
                <p className="text-foreground leading-relaxed">{result.overview}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg mb-3">Schedule</h3>
                <ol className="space-y-2">
                  {result.blocks.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                      <div className="w-28 shrink-0 font-mono text-sm text-muted-foreground">{b.time}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{b.task}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor[b.priority]}`}>{b.priority}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{b.rationale}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              {result.optimizationTips.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="font-serif text-lg mb-3">Optimization tips</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    {result.optimizationTips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              )}
            </>
          )}
          {!mutation.isPending && !result && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">Your plan will appear here.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
