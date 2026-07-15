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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { researchAssistant } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — ProdAI" },
      { name: "description", content: "Summaries, insights, recommendations, and simplified explanations." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchAssistant);
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<"summarize" | "topic">("summarize");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { content, mode } }),
    onSuccess: (res) => { if (!res.ok) toast.error(res.error); },
    onError: (e) => toast.error(e.message),
  });
  const result = mutation.data?.ok ? mutation.data.data : null;

  return (
    <AppShell>
      <FeatureHeader
        title="AI Research Assistant"
        description="Paste an article or enter a topic. Get a briefing with insights, recommendations, and simplified explanations."
      />
      <div className="mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-5 gap-6">
        <form className="lg:col-span-2 space-y-4 rounded-xl bg-card border border-border p-5"
          onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
          <div>
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="summarize">Summarize provided content</SelectItem>
                <SelectItem value="topic">Explore a topic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="c">{mode === "summarize" ? "Article / content" : "Topic or question"}</Label>
            <Textarea id="c" rows={14} value={content} onChange={(e) => setContent(e.target.value)} required minLength={10}
              placeholder={mode === "summarize" ? "Paste the article text…" : "e.g. What are the tradeoffs of asynchronous work?"} />
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Research
          </Button>
        </form>

        <div className="lg:col-span-3 space-y-4">
          {mutation.isPending && <div className="rounded-xl border border-border bg-card p-6 animate-pulse text-muted-foreground">Researching…</div>}
          {result && (
            <>
              <Section title="Summary"><p className="leading-relaxed">{result.summary}</p></Section>
              <Section title="Key insights">
                <ul className="list-disc pl-5 space-y-1.5">{result.keyInsights.map((k, i) => <li key={i}>{k}</li>)}</ul>
              </Section>
              <Section title="Recommendations">
                <ul className="list-disc pl-5 space-y-1.5">{result.recommendations.map((k, i) => <li key={i}>{k}</li>)}</ul>
              </Section>
              <Section title="Explain it simply">
                <p className="leading-relaxed text-foreground">{result.simplifiedExplanation}</p>
              </Section>
              {result.furtherQuestions.length > 0 && (
                <Section title="Further questions to explore">
                  <ul className="list-disc pl-5 space-y-1.5">{result.furtherQuestions.map((k, i) => <li key={i}>{k}</li>)}</ul>
                </Section>
              )}
            </>
          )}
          {!mutation.isPending && !result && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">Your briefing will appear here.</div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-serif text-lg mb-3">{title}</h3>
      {children}
    </div>
  );
}
