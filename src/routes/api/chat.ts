import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { getUserFromRequest } from "@/integrations/supabase/request-user.server";
import { checkFeatureLimit } from "@/lib/subscription/plans";
import { incrementUsage, loadUsageAndPlan } from "@/lib/subscription/usage.server";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";
import {
  getOrCreateConversation,
  saveMessage,
  getConversationHistory,
  getRecentConversations,
} from "@/lib/chat/conversation.server";
import { getMemories, buildMemoryContext } from "@/lib/chat/memory.server";
import { extractAndStoreMemories } from "@/lib/chat/memory-extraction.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, userName, conversationId, newConversation } = (await request.json()) as {
          messages?: UIMessage[];
          userName?: string;
          conversationId?: string;
          newConversation?: boolean;
        };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.OPENROUTER_API_KEY;
        if (!key) return new Response("Missing OPENROUTER_API_KEY", { status: 500 });

        // Authenticate and enforce plan limits server-side.
        const user = await getUserFromRequest(request);
        if (!user) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }
        const { plan, isPro, usage } = await loadUsageAndPlan(user.supabase, user.userId);
        if (!checkFeatureLimit("ai_conversations", { plan, isPro }, usage.ai_conversations)) {
          return new Response(
            JSON.stringify({
              error: "limit_reached",
              message:
                "Your free limit has been reached. Upgrade to CareCircleAI Pro for unlimited access.",
            }),
            { status: 402, headers: { "content-type": "application/json" } },
          );
        }

        // Reserve the conversation slot before streaming.
        await incrementUsage(user.supabase, user.userId, "ai_conversations");

        // --- Conversation persistence ---
        let convId: string;
        if (newConversation) {
          convId = await getOrCreateConversation(user.supabase, user.userId);
        } else if (conversationId) {
          convId = await getOrCreateConversation(user.supabase, user.userId, conversationId);
        } else {
          // Reuse most recent conversation or create new
          const recent = await getRecentConversations(user.supabase, user.userId, 1);
          if (recent.length > 0) {
            convId = recent[0].id;
          } else {
            convId = await getOrCreateConversation(user.supabase, user.userId);
          }
        }

        // Save the latest user message to the database.
        const lastUserMsg = messages.filter((m) => m.role === "user").at(-1);
        if (lastUserMsg) {
          const text = lastUserMsg.parts
            ?.map((p) => (p.type === "text" ? p.text : ""))
            .join("") ?? "";
          if (text.trim()) {
            await saveMessage(user.supabase, user.userId, convId, "user", text);
          }
        }

        // Load conversation history from database for model context.
        const history = await getConversationHistory(
          user.supabase,
          user.userId,
          convId,
        );

        // Build model messages from database history (not from client).
        const modelHistory = history.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));

        // Load user memories for context.
        const memories = await getMemories(user.supabase, user.userId);
        const memoryContext = buildMemoryContext(memories);

        // Build system prompt with memories and user name.
        const system = buildSystemPrompt(userName, memoryContext);

        // Stream the AI response.
        const gateway = createLovableAiGatewayProvider(key);
        const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";

        const result = streamText({
          model: gateway(model),
          system,
          messages: modelHistory,
          onFinish: async ({ text }) => {
            // Save the assistant response to the database.
            if (text?.trim()) {
              await saveMessage(user.supabase, user.userId, convId, "assistant", text);
            }

            // Extract memories asynchronously (don't block response).
            const allMessages = history.concat(
              lastUserMsg
                ? [{
                    role: "user" as const,
                    content: lastUserMsg.parts
                      ?.map((p) => (p.type === "text" ? p.text : ""))
                      .join("") ?? "",
                  }]
                : [],
            ).concat(
              text?.trim()
                ? [{ role: "assistant" as const, content: text }]
                : [],
            );
            void extractAndStoreMemories(user.supabase, user.userId, allMessages);
          },
        });

        // Return the stream along with the conversation ID for the client.
        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          headers: {
            "X-Conversation-Id": convId,
          },
        });
      },
    },
  },
});
