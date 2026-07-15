# Plan: AI-Powered Workplace Productivity Assistant (CAPACITI Submission)

## 1. Goal & Scope
Deliver a complete submission for the CAPACITI AI Skill Accelerator brief:
- A working web app with 5 AI features (Email Generator, Meeting Summarizer, Task Planner, Research Assistant, Chatbot)
- In-app project documentation page
- A downloadable PPTX presentation deck

Tech: existing TanStack Start template + Tailwind v4 + Lovable AI Gateway (via AI SDK). No database (chatbot uses no persistence, threaded per browser session in memory only).

## 2. Design System

Update `src/styles.css` tokens (oklch) to a professional, warm-productivity palette (not generic blue/purple):
- Background: warm off-white `oklch(0.985 0.005 90)`, dark mode near-black
- Primary: deep teal `oklch(0.45 0.09 190)` — trustworthy, modern
- Accent: warm amber `oklch(0.75 0.14 70)` — energy/highlights
- Muted surfaces / cards / borders tuned to match
- Radii bumped slightly for a friendly SaaS feel

Typography via `<link>` in `__root.tsx` head:
- Headings: **Instrument Serif** (distinctive, editorial)
- Body/UI: **Inter**

Add semantic tokens for `--gradient-hero`, `--shadow-elevated`, `--transition-smooth`. All components use tokens — no hardcoded colors.

Custom shadcn button variants: `hero` (gradient), `soft` (subtle tinted).

## 3. Dependencies
Install via `bun add`:
- `ai` (Vercel AI SDK)
- `@ai-sdk/react`
- `@ai-sdk/openai-compatible`
- `zod`
- `react-markdown`
- `remark-gfm`

Provision `LOVABLE_API_KEY` via `ai_gateway--create`.

Install AI Elements components: `bunx ai-elements@latest add conversation message prompt-input shimmer`.

## 4. File Structure

```
src/
  lib/
    ai-gateway.server.ts        # Provider helper (Lovable AI Gateway)
    ai.functions.ts             # createServerFn wrappers (email/summarize/plan/research)
  components/
    AppShell.tsx                # Sidebar nav layout wrapper
    FeatureHeader.tsx           # Title + description + AI disclaimer
    features/
      EmailGenerator.tsx
      MeetingSummarizer.tsx
      TaskPlanner.tsx
      ResearchAssistant.tsx
    ai-elements/*               # generated
  routes/
    __root.tsx                  # updated head metadata + fonts
    index.tsx                   # Dashboard landing (hero + feature cards)
    email.tsx
    summarize.tsx
    planner.tsx
    research.tsx
    chat.tsx                    # index — creates thread and navigates
    chat.$threadId.tsx          # chatbot UI
    docs.tsx                    # project documentation page
    api/
      chat.ts                   # streaming chat endpoint
    sitemap[.]xml.ts
  styles.css                    # updated design tokens
public/
  robots.txt
```

## 5. Backend: AI Server Functions

`src/lib/ai-gateway.server.ts` — copy the canonical Lovable AI Gateway provider helper (createLovableAiGatewayProvider) exactly per knowledge.

`src/lib/ai.functions.ts` — one `createServerFn` per feature, model `openai/gpt-5.5`, structured output via `Output.object` with `{ structuredOutputs: true }` provider. Wrap each in `try/catch` for `NoObjectGeneratedError` fallback. Return typed DTOs.

### 5.1 `generateEmail`
Input (Zod): `{ purpose, audience: "client"|"manager"|"team"|"other", tone: "formal"|"informal"|"persuasive", keyPoints, sender?, recipient? }`
System prompt: professional business communication expert; adapt vocabulary, greeting, and sign-off to audience+tone.
Output schema: `{ subject, body, notes (string — reviewer tips) }`

### 5.2 `summarizeMeeting`
Input: `{ notes: string }`
Output: `{ summary, keyDecisions: string[], actionItems: {task, owner (nullable), deadline (nullable)}[], risks: string[] }`
Prompt reinforces extraction of concrete deliverables.

### 5.3 `planTasks`
Input: `{ tasks: string, horizon: "day"|"week", workHoursPerDay, priorities? }`
Output: `{ overview, blocks: {time, task, priority: "high"|"medium"|"low", rationale}[], optimizationTips: string[] }`
Prompt applies Eisenhower/time-boxing.

### 5.4 `researchAssistant`
Input: `{ content: string, mode: "summarize"|"topic" }`
Output: `{ summary, keyInsights: string[], recommendations: string[], simplifiedExplanation, furtherQuestions: string[] }`

### 5.5 Chat: `src/routes/api/chat.ts`
Server route with POST handler. Reads `LOVABLE_API_KEY` from env, builds provider, calls `streamText` with a workplace-assistant system prompt, returns `result.toUIMessageStreamResponse({ originalMessages })`. Wrap with `withLovableAiGatewayRunIdHeader` per gateway helper.

All server files: read `process.env.LOVABLE_API_KEY` inside handler; return 402/429 status messages surfaced to UI when the gateway errors.

## 6. Frontend Implementation

### 6.1 `__root.tsx`
- Update `head()`: title "ProdAI — AI Workplace Productivity Assistant", proper description, og:title/description/type, twitter:card
- Add Google Fonts `<link>` for Instrument Serif + Inter (per Tailwind v4 rule: link in head, not @import in CSS)
- Keep `<Outlet />`, QueryClientProvider, error/notFound components

### 6.2 `AppShell.tsx`
Persistent left sidebar (collapses on mobile to top nav) with:
- Brand mark ("ProdAI" + small generated logo icon in `src/assets/`)
- Nav links: Dashboard, Email, Summarize, Plan, Research, Chat, Docs
- Footer with "AI outputs may need review" disclaimer

### 6.3 `index.tsx` (Dashboard)
- Hero: headline "Your AI Workplace Assistant", subhead, primary CTA "Open Chatbot", secondary "Explore Features"
- Hero image: generated (imagegen fast) — abstract productivity illustration
- 5 feature cards (icon, title, description, CTA link) in responsive grid
- "How it works" 3-step section
- Responsible AI note

### 6.4 Feature Pages
Common shape: `FeatureHeader` + form on left (30–40% width md+) + result panel on right. On mobile stack vertically.

Each feature:
- Uses `useMutation` from React Query wrapping the server function via `useServerFn`
- Shows loading state with `Shimmer` from AI Elements
- Renders result with structured cards + `react-markdown` for prose
- "Copy" and "Regenerate" buttons on result
- Explicit disclaimer + link to Docs "Responsible AI" section
- Toast on error (rate limit → "Try again shortly", 402 → "AI credits exhausted, ask admin to top up")

### 6.5 Chatbot (`chat.tsx` + `chat.$threadId.tsx`)
- `chat.tsx` (index): on mount, generate `crypto.randomUUID()`, navigate to `/chat/{id}`
- `chat.$threadId.tsx`: layout with left thread list (in-memory via a zustand-free React context stored at component root — actually since no persistence and threads are session-only, use module-level `Map<string, UIMessage[]>` + `useSyncExternalStore` or simple React state lifted to a shared provider mounted in AppShell); new-thread button creates new id + navigates
- Chat window keyed by `threadId`; passes `threadId` as `useChat` `id`
- Uses AI Elements: `Conversation`, `ConversationContent`, `ConversationScrollButton`, `Message`, `MessageContent`, `MessageResponse`, `PromptInput`, `PromptInputTextarea`, `PromptInputFooter`, `PromptInputSubmit`, `Shimmer`
- Textarea auto-focus on mount, after send, after stream complete, after thread switch
- Assistant messages no background; user messages use `primary` bg / `primary-foreground` text
- Empty state uses generated app logo (not `Sparkles`)
- Submit disabled while `submitted`/`streaming`; stop button wired to `stop()`

### 6.6 `docs.tsx`
Rendered in-app documentation covering:
- Problem statement (from brief, in own words)
- Solution overview
- Tools used: Lovable AI Gateway, Vercel AI SDK, TanStack Start, React, Tailwind CSS
- Sample prompts (one per feature) as code blocks
- Prompt engineering strategy (structured output, role priming, audience adaptation)
- Responsible AI: bias risks, hallucination, PII considerations, mitigations (disclaimers, human review, no persistence for chat)
- Challenges & solutions
- Impact & productivity gains

Rendered from a markdown constant with `react-markdown` for maintainability.

## 7. Responsible AI Safeguards (visible in-product)
- Disclaimer banner on every feature: "AI-generated. Review before use."
- No storage of chat conversations (documented explicitly)
- Input validation server-side (Zod)
- Server-side error messages surfaced to UI
- Docs page includes limitations & bias section

## 8. Assets
Generate with `imagegen`:
- Hero illustration: `src/assets/hero-productivity.jpg` (fast, 1600x900) — abstract workspace with soft teal/amber gradients
- App logo mark: `src/assets/logo.png` (fast, transparent, 512x512) — abstract "P + spark" mark in teal/amber

Imported via ES6 in components.

## 9. SEO & Metadata
- Per-route `head()` with unique title/description/og
- `public/robots.txt` — allow all
- `src/routes/sitemap[.]xml.ts` — list `/`, `/email`, `/summarize`, `/planner`, `/research`, `/chat`, `/docs`

## 10. Slide Deck (PPTX)
Generated with `pptxgenjs` script, saved to `/mnt/documents/AI_Productivity_Assistant_Presentation.pptx`. 8 slides in **Ocean Gradient** palette (deep blue/teal/midnight), Georgia headers + Calibri body:

1. **Title** — "AI-Powered Workplace Productivity Assistant" + subtitle + candidate placeholder + CAPACITI reference
2. **Problem** — big stat callout + 3 bullet pains
3. **Solution Overview** — 2-column: description + illustration
4. **Feature Showcase (Part 1)** — Email Generator, Meeting Summarizer, Task Planner (icon cards)
5. **Feature Showcase (Part 2)** — Research Assistant, Chatbot (icon cards + screenshot placeholder)
6. **Prompt Engineering Strategy** — structured output, role priming, audience/tone control (with a sample prompt code block)
7. **Responsible AI** — 3-column: Bias | Hallucination | Privacy, with mitigations
8. **Impact & Next Steps** — productivity metrics estimate + roadmap + thank-you

Each slide: 40–54pt title, 20–24pt body, 0.5" margins, icon-in-circle motif. Embed generated hero image as base64. Run visual QA via LibreOffice → pdftoppm → view each slide, iterate on fixes.

## 11. QA Checklist
- Typecheck passes (`tsgo`)
- Each server function returns valid structured data for a sample input (test via `code--exec` calling the preview URL, or via `invoke-server-function`)
- Chat streams end-to-end in the preview (verified with Playwright screenshot)
- Mobile viewport (375px) renders each feature cleanly (Playwright screenshots)
- Slides pass visual inspection (no overlap, contrast OK, no leftover placeholder text)
- Docs page renders markdown correctly
- No `Sparkles` icon used as brand mark
- No hardcoded colors in components

## 12. Deliverables to User
- Working app on the Lovable preview URL
- In-app Docs page (`/docs`)
- PPTX at `/mnt/documents/AI_Productivity_Assistant_Presentation.pptx` (download link)
- Suggestion to publish via Lovable at the end

## 13. Out of Scope (for now)
- Authentication / multi-user accounts
- Persistent chat history (explicitly rejected by user — no persistence)
- Email/calendar integrations (Gmail/Outlook connectors)
- Export to PDF/Docx from features

## 14. Open Questions
None. All scope decisions resolved. I'll proceed on approval.