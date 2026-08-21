import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Supabase = SupabaseClient<Database>;

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  created_at: string;
}

export async function getOrCreateConversation(
  supabase: Supabase,
  userId: string,
  conversationId?: string,
): Promise<string> {
  if (conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (data) return data.id;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function saveMessage(
  supabase: Supabase,
  userId: string,
  conversationId: string,
  role: "system" | "user" | "assistant",
  content: string,
): Promise<void> {
  const { error } = await supabase.from("chat_messages").insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content,
  });
  if (error) throw new Error(error.message);
}

export async function getConversationHistory(
  supabase: Supabase,
  userId: string,
  conversationId: string,
  limit = 30,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentConversations(
  supabase: Supabase,
  userId: string,
  limit = 5,
): Promise<{ id: string; title: string | null; updated_at: string }[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateConversationTitle(
  supabase: Supabase,
  userId: string,
  conversationId: string,
  title: string,
): Promise<void> {
  await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId)
    .eq("user_id", userId);
}
