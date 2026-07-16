import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, gatewayErrorMessage } from "./ai-gateway.server";

const MODEL = "openai/gpt-5.5";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key, { structuredOutputs: true })(MODEL);
}

// ---------- Email Generator ----------
const emailInput = z.object({
  purpose: z.string().min(3),
  audience: z.enum(["client", "manager", "team", "other"]),
  tone: z.enum(["formal", "informal", "persuasive"]),
  keyPoints: z.string().min(3),
  sender: z.string().optional(),
  recipient: z.string().optional(),
});

const emailSchema = z.object({
  subject: z.string(),
  body: z.string(),
  notes: z.string(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailInput.parse(data))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        providerOptions: { lovable: { service_tier: "priority" } },
        output: Output.object({ schema: emailSchema }),
        system:
          "You are an expert business communications writer. Write concise, effective professional emails. Adapt greetings, vocabulary, and sign-off to the specified audience and tone. Keep body under 250 words.",
        prompt: `Purpose: ${data.purpose}
Audience: ${data.audience}
Tone: ${data.tone}
Key points: ${data.keyPoints}
${data.sender ? `Sender: ${data.sender}` : ""}
${data.recipient ? `Recipient: ${data.recipient}` : ""}

Return a subject line, the full email body (with greeting and sign-off), and 1-2 short reviewer notes explaining tone/audience choices.`,
      });
      return { ok: true as const, data: output };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        return { ok: false as const, error: "AI produced malformed output. Try again." };
      }
      return { ok: false as const, error: gatewayErrorMessage(err) };
    }
  });

// ---------- Meeting Summarizer ----------
const summarizeInput = z.object({ notes: z.string().min(20) });
const summarizeSchema = z.object({
  summary: z.string(),
  keyDecisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string().nullable(),
      deadline: z.string().nullable(),
    }),
  ),
  risks: z.array(z.string()),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => summarizeInput.parse(data))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        providerOptions: { lovable: { service_tier: "priority" } },
        output: Output.object({ schema: summarizeSchema }),
        system:
          "You are a meeting analyst. Read raw meeting notes and extract: a concise executive summary (2-3 sentences), key decisions, concrete action items (with owner and deadline when mentioned; otherwise null), and any risks or open questions.",
        prompt: `Meeting notes:\n\n${data.notes}`,
      });
      return { ok: true as const, data: output };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        return { ok: false as const, error: "AI produced malformed output. Try again." };
      }
      return { ok: false as const, error: gatewayErrorMessage(err) };
    }
  });

// ---------- Task Planner ----------
const plannerInput = z.object({
  tasks: z.string().min(5),
  horizon: z.enum(["day", "week"]),
  workHoursPerDay: z.number().min(1).max(16),
  priorities: z.string().optional(),
});
const plannerSchema = z.object({
  overview: z.string(),
  blocks: z.array(
    z.object({
      time: z.string(),
      task: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      rationale: z.string(),
    }),
  ),
  optimizationTips: z.array(z.string()),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => plannerInput.parse(data))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        providerOptions: { lovable: { service_tier: "priority" } },
        output: Output.object({ schema: plannerSchema }),
        system:
          "You are a productivity coach. Apply the Eisenhower matrix and time-boxing to plan the user's work. Group similar tasks, protect deep-work blocks, and leave buffer time.",
        prompt: `Horizon: ${data.horizon}
Work hours per day: ${data.workHoursPerDay}
${data.priorities ? `User priorities: ${data.priorities}` : ""}

Tasks:
${data.tasks}

Return an overview, a scheduled list of blocks (with time like "09:00-10:30" for a day plan, or "Mon AM" for a week plan), and 3-5 time-optimization tips.`,
      });
      return { ok: true as const, data: output };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        return { ok: false as const, error: "AI produced malformed output. Try again." };
      }
      return { ok: false as const, error: gatewayErrorMessage(err) };
    }
  });

// ---------- Research Assistant ----------
const researchInput = z.object({
  content: z.string().min(10),
  mode: z.enum(["summarize", "topic"]),
});
const researchSchema = z.object({
  summary: z.string(),
  keyInsights: z.array(z.string()),
  recommendations: z.array(z.string()),
  simplifiedExplanation: z.string(),
  furtherQuestions: z.array(z.string()),
});

export const researchAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => researchInput.parse(data))
  .handler(async ({ data }) => {
    try {
      const { output } = await generateText({
        model: getModel(),
        providerOptions: { lovable: { service_tier: "priority" } },
        output: Output.object({ schema: researchSchema }),
        system:
          "You are a research analyst. Produce structured briefings that are accurate, balanced, and easy to skim. When summarizing user-provided content, stay grounded in the source. When exploring a topic from general knowledge, note that facts may be outdated.",
        prompt:
          data.mode === "summarize"
            ? `Summarize this content and extract insights:\n\n${data.content}`
            : `Explore this topic and provide a briefing:\n\n${data.content}`,
      });
      return { ok: true as const, data: output };
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        return { ok: false as const, error: "AI produced malformed output. Try again." };
      }
      return { ok: false as const, error: gatewayErrorMessage(err) };
    }
  });
