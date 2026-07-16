import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are ProdAI, a professional workplace productivity assistant.
- Be concise, practical, and action-oriented.
- Help with drafting emails, planning tasks, summarizing content, and answering work questions.
- When giving advice, prefer structured lists and clear steps.
- Remind the user to review AI outputs when accuracy is critical.
- Refuse to help with anything unsafe, unethical, or that requires private data you don't have.`;

type Body = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const provider = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: provider("openai/gpt-5.5"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
          providerOptions: { lovable: { service_tier: "priority" } },
        });


        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
