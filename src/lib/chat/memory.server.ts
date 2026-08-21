import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Supabase = SupabaseClient<Database>;

export type MemoryCategory =
  | "general"
  | "preference"
  | "family"
  | "routine"
  | "health_context"
  | "communication";

export interface Memory {
  id: string;
  memory: string;
  category: MemoryCategory;
  created_at: string;
  updated_at: string;
}

export async function getMemories(
  supabase: Supabase,
  userId: string,
): Promise<Memory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select("id, memory, category, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getMemoriesByCategory(
  supabase: Supabase,
  userId: string,
  category: MemoryCategory,
): Promise<Memory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select("id, memory, category, created_at, updated_at")
    .eq("user_id", userId)
    .eq("category", category)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createMemory(
  supabase: Supabase,
  userId: string,
  memory: string,
  category: MemoryCategory = "general",
): Promise<Memory> {
  const { data, error } = await supabase
    .from("memories")
    .insert({ user_id: userId, memory, category })
    .select("id, memory, category, created_at, updated_at")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateMemory(
  supabase: Supabase,
  userId: string,
  memoryId: string,
  memory: string,
  category?: MemoryCategory,
): Promise<void> {
  const update: { memory: string; category?: MemoryCategory } = { memory };
  if (category) update.category = category;
  const { error } = await supabase
    .from("memories")
    .update(update)
    .eq("id", memoryId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function deleteMemory(
  supabase: Supabase,
  userId: string,
  memoryId: string,
): Promise<void> {
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", memoryId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function deleteAllMemories(
  supabase: Supabase,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

/**
 * Build the memory context string for the system prompt.
 * Returns all user memories in a concise format for the AI.
 */
export function buildMemoryContext(memories: Memory[]): string {
  if (memories.length === 0) return "";
  const lines = memories.map((m) => `- [${m.category}] ${m.memory}`);
  return `Known information about this user:\n${lines.join("\n")}`;
}
