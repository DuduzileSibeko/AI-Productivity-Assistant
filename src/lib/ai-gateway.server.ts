import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createLovableAiGatewayProvider(
  lovableApiKey: string,
  options?: { structuredOutputs?: boolean },
) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: options?.structuredOutputs ?? false,
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export function gatewayErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/429|rate.?limit/i.test(message)) {
    return "AI service is busy. Please try again in a moment.";
  }
  if (/402|credit|payment/i.test(message)) {
    return "AI credits exhausted. Please add credits in your workspace billing.";
  }
  return "AI request failed. Please try again.";
}
