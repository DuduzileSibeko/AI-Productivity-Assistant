import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { FeatureHeader } from "@/components/FeatureHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/summarize")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — ProdAI" },
      { name: "description", content: "Turn raw meeting notes into summaries, decisions, and action items." },
    ],
  }),
  component: SummarizePage,
});

const EXAMPLE = `Q3 planning call, 45 min.
Attendees: Alex (PM), Priya (Eng), Jordan (Design), Sam (Sales).
- Discussed pipeline: 3 enterprise deals slipping to Q4. Sam to confirm forecast by Fri.
- Eng: mobile release on track for Aug 15. Priya flagged risk if API rate limits aren't lifted.
- Design: new onboarding flow ready for user tests next week. Jordan to schedule 5 sessions.
- Decision: launch pricing update Sep 1. Alex owns comms.
- Open: budget for paid ads not confirmed.`;

export default undefined;

function SummarizePage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const mutation = useMutation({
    mutationFn: () => fn({ data: { notes } }),
    onSuccess: (res) => { if (!res.ok) toast.error(res.error); },
    onError: (e) => toast.error(e.message),
  });
  const result = mutation.data?.ok ? mutation.data.data : null;

  return (
    <AppShell>
      <FeatureHeader
        title="Meeting Notes Summarizer"
        description="Paste raw notes or a transcript. Get a summary, decisions, action items with owners and deadlines, and risks."
      />
      <div className="mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-5 gap-6">
        <form
          className="lg:col-span-2 space-y-4 rounded-xl bg-card border border-border p-5"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        >
          <div>
            <Label htmlFor="notes">Meeting notes</Label>
            <Textarea id="notes" rows={16} value={notes} onChange={(e) => setNotes(e.target.value)} required minLength={20} placeholder="Paste notes here…" />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setNotes(EXAMPLE)}>Use example</Button>
            <Button type="submit" disabled={mutation.isPending} className="flex-1">
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Summarize
            </Button>
          </div>
        </form>

        <div className="lg:col-span-3 space-y-4">
          {mutation.isPending && <div className="rounded-xl border border-border bg-card p-6 animate-pulse text-muted-foreground">Summarizing…</div>}
          {result && (
            <>
              <Card title="Executive summary"><p className="leading-relaxed">{result.summary}</p></Card>
              <Card title="Key decisions">
                <ul className="space-y-2 list-disc pl-5">
                  {result.keyDecisions.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </Card>
              <Card title="Action items">
                <ul className="space-y-3">
                  {result.actionItems.map((a, i) => (
                    <li key={i} className="rounded-lg border border-border bg-muted/40 p-3">
                      <div className="font-medium">{a.task}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                        <span>Owner: {a.owner ?? "—"}</span>
                        <span>Deadline: {a.deadline ?? "—"}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              {result.risks.length > 0 && (
                <Card title="Risks & open questions">
                  <ul className="space-y-2 list-disc pl-5">
                    {result.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </Card>
              )}
            </>
          )}
          {!mutation.isPending && !result && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">Your summary will appear here.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-serif text-lg mb-3">{title}</h3>
      {children}
    </div>
  );
}
