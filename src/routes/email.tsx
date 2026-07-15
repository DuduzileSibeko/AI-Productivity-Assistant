import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { FeatureHeader } from "@/components/FeatureHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — ProdAI" },
      { name: "description", content: "Generate professional emails adapted to tone and audience." },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState<"client" | "manager" | "team" | "other">("client");
  const [tone, setTone] = useState<"formal" | "informal" | "persuasive">("formal");
  const [keyPoints, setKeyPoints] = useState("");
  const [recipient, setRecipient] = useState("");
  const [sender, setSender] = useState("");

  const mutation = useMutation({
    mutationFn: () => fn({ data: { purpose, audience, tone, keyPoints, recipient, sender } }),
    onSuccess: (res) => {
      if (!res.ok) toast.error(res.error);
    },
    onError: (e) => toast.error(e.message),
  });

  const result = mutation.data?.ok ? mutation.data.data : null;

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    toast.success("Copied to clipboard");
  };

  return (
    <AppShell>
      <FeatureHeader
        title="Smart Email Generator"
        description="Describe the purpose, choose an audience and tone, and generate a professional email in seconds."
      />
      <div className="mx-auto max-w-6xl px-6 py-8 grid lg:grid-cols-5 gap-6">
        <form
          className="lg:col-span-2 space-y-4 rounded-xl bg-card border border-border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Follow up on Q3 proposal"
              required
              minLength={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Audience</Label>
              <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="key">Key points</Label>
            <Textarea
              id="key"
              rows={5}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="- Confirm meeting for next Tuesday&#10;- Share updated pricing&#10;- Ask about decision timeline"
              required
              minLength={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Jane, Head of Ops" />
            </div>
            <div>
              <Label htmlFor="sender">Sender (optional)</Label>
              <Input id="sender" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Alex" />
            </div>
          </div>
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate email
          </Button>
        </form>

        <div className="lg:col-span-3">
          {mutation.isPending && (
            <div className="rounded-xl border border-border bg-card p-6 animate-pulse text-muted-foreground">
              Drafting your email…
            </div>
          )}
          {result && (
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Subject</div>
                  <h2 className="font-serif text-2xl">{result.subject}</h2>
                </div>
                <Button variant="outline" size="sm" onClick={copy}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">{result.body}</div>
              {result.notes && (
                <div className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  <strong className="text-foreground">Reviewer notes:</strong> {result.notes}
                </div>
              )}
            </div>
          )}
          {!mutation.isPending && !result && (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Your generated email will appear here.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
