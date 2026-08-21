import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getMemories, createMemory, updateMemory, type MemoryCategory } from "./memory.server";

type Supabase = SupabaseClient<Database>;

const EXTRACTION_PROMPT = `You are a memory extraction system for a care companion app. Given a short conversation between a user and an AI assistant, determine if the user shared any information worth remembering across future conversations.

Return ONLY valid JSON, no code fences:
{"memories": [{"memory": "concise fact", "category": "preference|family|routine|health_context|communication|general"}]}

Rules:
- ONLY extract stable, reusable information (names, relationships, preferences, routines, communication style).
- Do NOT extract temporary states ("I feel dizzy"), opinions about today, or one-off comments.
- Do NOT extract sensitive medical details unless the user explicitly asked the AI to remember them.
- Do NOT extract information that is already in the user's profile (name, age, medical conditions).
- Keep each memory to one short sentence.
- If nothing worth remembering, return {"memories": []}.

Categories:
- "preference": Things the user prefers (tea vs coffee, morning walks, etc.)
- "family": Family members, relationships, names, visiting patterns
- "routine": Daily habits, schedules, recurring activities
- "health_context": Non-sensitive health context the user wants remembered
- "communication": How the user likes to communicate
- "general": Anything else worth remembering

Conversation:
`;

/**
 * Extract memories from a conversation and store them in the database.
 * Called asynchronously after the AI responds — does not block the user.
 */
export async function extractAndStoreMemories(
  supabase: Supabase,
  userId: string,
  recentMessages: { role: string; content: string }[],
): Promise<void> {
  // Need at least 2 user messages to extract meaningful info
  const userMessages = recentMessages.filter((m) => m.role === "user");
  if (userMessages.length < 2) return;

  const transcript = recentMessages
    .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
    .join("\n");

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return;

  try {
    const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
    const gateway = createLovableAiGatewayProvider(key);
    const { text } = await generateText({
      model: gateway(model),
      prompt: EXTRACTION_PROMPT + transcript,
    });

    const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
    const result = JSON.parse(cleaned) as {
      memories: { memory: string; category: MemoryCategory }[];
    };

    if (!result.memories || result.memories.length === 0) return;

    // Get existing memories to check for duplicates/updates
    const existing = await getMemories(supabase, userId);
    const existingTexts = new Set(existing.map((m) => m.memory.toLowerCase()));

    for (const item of result.memories) {
      if (!item.memory || !item.category) continue;

      const text = item.memory.trim();
      if (existingTexts.has(text.toLowerCase())) continue;

      // Check if this is an update of an existing memory (similar category + partial match)
      const similar = existing.find(
        (m) =>
          m.category === item.category &&
          (m.memory.toLowerCase().includes(text.toLowerCase().slice(0, 20)) ||
            text.toLowerCase().includes(m.memory.toLowerCase().slice(0, 20))),
      );

      if (similar) {
        // Update the existing memory with the newer version
        await updateMemory(supabase, userId, similar.id, text, item.category);
      } else {
        await createMemory(supabase, userId, text, item.category);
      }
    }
  } catch {
    // Memory extraction is best-effort — don't fail the chat
  }
}
