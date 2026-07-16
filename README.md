ProdAI — AI Workplace Productivity Assistant

Live app: https://comforting-compiler.lovable.app
Submission for: the CAPACITI AI Skill Accelerator Programme

AI outputs may need review. Verify before sending.

What it is

ProdAI is an AI-powered workplace productivity assistant. Professionals across industries spend hours every week on repetitive knowledge work — drafting emails, summarizing meetings, planning tasks, and researching topics. ProdAI automates five of the most common workflows so people can focus on higher-value work, all from one clean, focused web app. No signup, no accounts, no tracking.

Features

FeatureRouteWhat it doesSmart Email Generator/emailProfessional emails adapted to audience and tone. Enter purpose, audience, tone, and key points; get a subject line, body, and reviewer notes.Meeting Notes Summarizer/summarizePaste raw meeting notes (min. 20 characters) and get an executive summary, key decisions, action items with owners/deadlines, and risks.AI Task Planner/plannerList your tasks, choose a day or week horizon, set work hours and priorities, and get a prioritized, time-boxed schedule.AI Research Assistant/researchPaste content to summarize or a topic to explore; get a briefing with key insights, recommendations, and a plain-language explanation.AI Chatbot/chatAn open-ended, interactive workplace assistant for quick questions. Conversations live only in browser memory.

Tech stack


Lovable AI Gateway — access to frontier language models (openai/gpt-5.5) with no third-party API keys.
Vercel AI SDK — model calls, streaming, and structured output through a single interface.
TanStack Start — full-stack React framework with server functions and streaming server routes.
Tailwind CSS v4 — oklch design tokens for a consistent, accessible visual system.
Zod — server-side input validation on every AI-facing endpoint.
React Markdown — safely renders AI-produced markdown in the UI.


Prompt engineering strategy

Every feature is built on a purpose-built prompt with three layers:


Role priming — the system prompt gives the model a specific role ("expert business communications writer," "meeting analyst," "productivity coach," "research analyst") to anchor tone and expertise.
Structured output — one-shot features return a strict JSON schema via the Vercel AI SDK's Output.object API, eliminating brittle regex parsing and keeping the UI deterministic.
Contextual variables — audience, tone, work hours, and horizon are passed as explicit prompt variables rather than baked into the prompt text, keeping behavior predictable and testable.


Example — Meeting Summarizer structured output schema:

json{
  "summary": "string",
  "keyDecisions": ["string"],
  "actionItems": [{ "task": "string", "owner": "string|null", "deadline": "string|null" }],
  "risks": ["string"]
}

Responsible AI


Human-in-the-loop reminders — a "Responsible AI" banner on every feature prompts users to review output before acting on it.
No chat persistence — the AI Chatbot stores conversations only in browser memory; a page refresh clears everything.
Server-side validation — all inputs are validated with Zod before any AI call, blocking malformed or oversized payloads.
Bias & hallucination transparency — the Research Assistant notes that facts from general knowledge may be outdated.
Clear error surfacing — rate-limit and credit-exhaustion errors from the AI Gateway are shown directly, not hidden behind generic text.
No PII collection — no accounts, tracking, or personal information required.


Challenges & solutions


Reliable structured output — solved with strict JSON schema mode on the OpenAI-compatible provider, keeping schemas flat.
Schema drift on retries — every structured call is wrapped in try/catch for NoObjectGeneratedError, returning a graceful fallback instead of a runtime crash.
Natural-feeling streamed chat — built with the Vercel AI SDK's useChat hook, with optimistic UI, a "Thinking…" state, and stop-generation control.


Getting started


Open the app — no signup required.
Pick a feature from the sidebar.
Be specific in your inputs — the more context you give, the better the output.
Always review AI-generated results before sending or acting on them.


Impact

If a professional saves 10 minutes per email (× 5 emails/day), plus 20 minutes on meeting summaries and 15 minutes on planning, that's over 1 hour reclaimed daily. Across a team of 20, that scales to 100+ hours per week of freed-up capacity
