import { createFileRoute } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Project Documentation — ProdAI" },
      { name: "description", content: "Problem statement, solution overview, prompts, and responsible AI notes." },
    ],
  }),
  component: DocsPage,
});

const DOC = `# ProdAI — Project Documentation

**Submission for the CAPACITI AI Skill Accelerator Programme.**

## 1. Problem Statement

Professionals across industries spend hours every week on repetitive knowledge work — drafting emails, summarizing meetings, planning tasks, and researching topics. This overhead reduces the time available for high-value, creative work and creates cognitive fatigue.

## 2. Solution Overview

**ProdAI** is an AI-powered workplace productivity assistant that automates five of the most common repetitive workflows:

1. **Smart Email Generator** — professional emails adapted to audience and tone.
2. **Meeting Notes Summarizer** — decisions, action items, and risks from raw notes.
3. **AI Task Planner** — prioritized daily or weekly schedules with time-optimization tips.
4. **AI Research Assistant** — briefings with insights, recommendations, and simplified explanations.
5. **AI Chatbot** — an interactive workplace assistant for open-ended queries.

The app is built as a modern web application with a clean, focused UI so professionals can access every feature from one place.

## 3. Tools Used

- **Lovable AI Gateway** — access to frontier language models (\`openai/gpt-5.5\`) with no third-party API keys.
- **Vercel AI SDK** — model calls, streaming, and structured output via a single interface.
- **TanStack Start** — full-stack React framework with server functions and streaming server routes.
- **Tailwind CSS v4** — design tokens (oklch) for a consistent, accessible visual system.
- **Zod** — server-side input validation for every AI-facing endpoint.
- **React Markdown** — rendering AI-produced markdown safely.

## 4. Prompt Engineering Strategy

Each feature uses a purpose-built prompt with three layers:

- **Role priming** — the system prompt gives the model a specific role ("expert business communications writer", "meeting analyst", "productivity coach", "research analyst"). This anchors tone and expertise.
- **Structured output** — every one-shot feature returns a **strict JSON schema** using the Vercel AI SDK's \`Output.object\` API. This eliminates brittle regex parsing and makes the UI deterministic.
- **Contextual variables** — audience, tone, work hours, and horizon are passed as explicit prompt variables, not baked into the prompt text. This makes prompt behavior predictable and testable.

### Sample prompts

**Email Generator (system):**
> You are an expert business communications writer. Write concise, effective professional emails. Adapt greetings, vocabulary, and sign-off to the specified audience and tone. Keep body under 250 words.

**Task Planner (system):**
> You are a productivity coach. Apply the Eisenhower matrix and time-boxing to plan the user's work. Group similar tasks, protect deep-work blocks, and leave buffer time.

**Meeting Summarizer (structured output schema):**

\`\`\`json
{
  "summary": "string",
  "keyDecisions": ["string"],
  "actionItems": [{ "task": "string", "owner": "string|null", "deadline": "string|null" }],
  "risks": ["string"]
}
\`\`\`

## 5. Responsible AI

- **Human-in-the-loop reminders** — every feature displays a "Responsible AI" banner instructing users to review output before acting on it.
- **No chat persistence** — the AI Chatbot stores conversations only in browser memory. Nothing is written to disk or a database. A page refresh clears everything.
- **Server-side validation** — all inputs are validated with Zod before any AI call, blocking malformed or oversized payloads.
- **Bias & hallucination transparency** — the research feature explicitly notes that facts from general knowledge may be outdated.
- **Error surfacing** — rate-limit and credit-exhaustion errors from the AI Gateway are shown clearly instead of hidden behind generic assistant text.
- **No PII collection** — the app does not require accounts, tracking, or personal information.

## 6. Challenges & Solutions

- **Getting reliable structured output** — solved by enabling strict JSON schema mode on the OpenAI-compatible provider and keeping schemas flat.
- **Preventing schema drift on retries** — wrapped every structured call in \`try/catch\` for \`NoObjectGeneratedError\` and returned a graceful fallback instead of a runtime crash.
- **Making streamed chat feel natural** — used the Vercel AI SDK \`useChat\` hook with immediate optimistic UI, "Thinking…" state, and stop-generation control.

## 7. How to Use

**Getting started:** open the app — no signup required. Pick a feature from the sidebar.

- **Smart Email Generator** (\`/email\`) — enter purpose, audience, tone, and key points. Click *Generate* to produce a subject line, full email body, and reviewer notes. Copy the output into your mail client.
- **Meeting Summarizer** (\`/summarize\`) — paste raw meeting notes (min. 20 characters). Returns an executive summary, key decisions, action items with owners/deadlines, and risks.
- **Task Planner** (\`/planner\`) — list your tasks, choose *day* or *week* horizon, set work hours, and add priorities. Returns a scheduled plan with time-optimization tips.
- **Research Assistant** (\`/research\`) — paste content to summarize or type a topic to explore. Returns a briefing with key insights, recommendations, and a plain-language explanation.
- **AI Chatbot** (\`/chat\`) — start a new thread and chat freely. Threads are held in browser memory only; refresh to reset.

**Tips:** be specific in your inputs — the more context you provide, the better the output. Always review AI results before sending or acting on them.

## 8. Impact

If a professional saves even **10 minutes per email × 5 emails/day** plus **20 minutes on meeting summaries** and **15 minutes on planning**, that's over **1 hour reclaimed daily**. Across a team of 20, that scales to **100+ hours per week** of freed-up capacity — measurable productivity gain from a small, focused set of AI tools.
`;


function DocsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <article className="prose prose-neutral max-w-none prose-headings:font-serif prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-a:text-primary dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{DOC}</ReactMarkdown>
        </article>
      </div>
    </AppShell>
  );
}
