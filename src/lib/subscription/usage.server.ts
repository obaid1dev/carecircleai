import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_USAGE, type PlanId, type UsageCounters } from "./plans";

export type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
export type UsageRow = Database["public"]["Tables"]["usage"]["Row"];

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The plan that actually applies to a user, derived from the subscription row
 * persisted by the Paddle webhook. Only an active Pro subscription counts.
 * This is the single enforcement point used by every server handler.
 */
export function effectivePlan(subscription: SubscriptionRow | null): PlanId {
  if (!subscription) return "free";
  if (subscription.plan !== "pro" || subscription.status !== "active") return "free";
  if (
    subscription.current_period_end &&
    new Date(subscription.current_period_end).getTime() <= Date.now()
  ) {
    return "free";
  }
  return "pro";
}

export async function getSubscriptionRow(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SubscriptionRow | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function getUsageRow(
  supabase: SupabaseClient<Database>,
  userId: string,
  date = todayStr(),
): Promise<UsageRow | null> {
  const { data, error } = await supabase
    .from("usage")
    .select("*")
    .eq("user_id", userId)
    .eq("usage_date", date)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function incrementUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  field: keyof UsageCounters,
  date = todayStr(),
): Promise<void> {
  const existing = await getUsageRow(supabase, userId, date);
  if (!existing) {
    const { error } = await supabase
      .from("usage")
      .insert({ user_id: userId, usage_date: date, [field]: 1 });
    if (error) throw new Error(error.message);
    return;
  }
  const next = (existing[field] ?? 0) + 1;
  const { error } = await supabase
    .from("usage")
    .update({ [field]: next })
    .eq("id", existing.id);
  if (error) throw new Error(error.message);
}

export async function loadUsageAndPlan(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ plan: PlanId; isPro: boolean; usage: UsageCounters }> {
  const [subscription, usageRow] = await Promise.all([
    getSubscriptionRow(supabase, userId),
    getUsageRow(supabase, userId),
  ]);
  const plan = effectivePlan(subscription);
  return {
    plan,
    isPro: plan === "pro",
    usage: usageRow
      ? {
          ai_conversations: usageRow.ai_conversations ?? 0,
          checkins: usageRow.checkins ?? 0,
        }
      : DEFAULT_USAGE,
  };
}
