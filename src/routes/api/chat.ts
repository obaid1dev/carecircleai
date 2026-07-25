import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are CareCircle, a warm, patient AI companion for an elderly user doing their daily check-in.

Your goals:
- Greet them kindly by name if known. Keep messages short (1-3 sentences) and easy to read.
- Ask, one at a time and naturally: how they're feeling, how they slept, whether they took their medications today, any pain or symptoms, and anything on their mind.
- Listen empathetically. If they mention pain, dizziness, sadness, confusion, or falls, gently ask a follow-up.
- Never diagnose. If they mention a serious symptom, encourage them to contact family or a doctor.
- After about 5-8 exchanges, wrap up warmly and remind them their family cares about them.
- Use plain language. No medical jargon. No lists unless helpful.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, userName } = (await request.json()) as {
          messages?: UIMessage[];
          userName?: string;
        };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.OPENROUTER_API_KEY;
        if (!key) return new Response("Missing OPENROUTER_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const system = userName
          ? `${SYSTEM_PROMPT}\n\nThe user's name is ${userName}.`
          : SYSTEM_PROMPT;

        const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
        const result = streamText({
          model: gateway(model),
          system,
          messages: convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
