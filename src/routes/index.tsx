import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarClock, Search, MessagesSquare, ArrowRight, Sparkle, ShieldCheck, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-productivity.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProdAI — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Boost workplace productivity with AI: emails, meeting summaries, plans, research, and chat.",
      },
    ],
  }),
  component: Dashboard,
});

const FEATURES = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Professional emails adapted to tone, audience, and purpose." },
  { to: "/summarize", icon: FileText, title: "Meeting Summarizer", desc: "Turn raw notes into decisions, action items, and risks." },
  { to: "/planner", icon: CalendarClock, title: "AI Task Planner", desc: "Prioritized daily or weekly plans with time optimization." },
  { to: "/research", icon: Search, title: "Research Assistant", desc: "Summaries, key insights, and simplified explanations." },
  { to: "/chat", icon: MessagesSquare, title: "AI Chatbot", desc: "An interactive workplace assistant for any quick question." },
] as const;

function Dashboard() {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkle className="h-3.5 w-3.5 text-accent" />
              CAPACITI · AI Skill Accelerator
            </span>
            <h1 className="mt-4 font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05]">
              Your AI-powered <em className="text-primary not-italic">workplace</em> assistant.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              ProdAI drafts your emails, summarizes meetings, plans your week, and researches
              anything — so you can focus on the work that matters.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/chat">Open Chatbot <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/email">Explore Features</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-40"
              style={{ background: "var(--gradient-hero)" }}
            />
            <img
              src={hero}
              alt="Abstract workplace productivity illustration"
              width={1600}
              height={900}
              className="rounded-2xl border border-border shadow-[var(--shadow-elevated)]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="font-serif text-2xl md:text-3xl mb-6">Five ways to work faster</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-[var(--shadow-soft)] transition-all"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                <span className="mt-4 inline-flex items-center text-sm text-primary group-hover:gap-2 gap-1 transition-all">
                  Try it <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-2xl bg-card border border-border p-8 grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-serif text-lg">Fast by design</h3>
              <p className="text-sm text-muted-foreground mt-1">Structured prompts return usable output the first time.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
              <Sparkle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg">Prompt-engineered</h3>
              <p className="text-sm text-muted-foreground mt-1">Every feature uses a purpose-built prompt with tone and audience controls.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg">Responsible AI</h3>
              <p className="text-sm text-muted-foreground mt-1">Disclaimers, no chat persistence, and human-in-the-loop reminders.</p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
