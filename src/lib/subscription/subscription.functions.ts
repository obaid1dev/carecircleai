import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { PLANS, type PlanId, type SubscriptionStatus } from "./plans";
import { effectivePlan, getSubscriptionRow, getUsageRow, todayStr } from "./usage.server";

/**
 * Current subscription + usage for the signed-in user.
 * This is the single query the UI uses to render plan state.
 */
export const getSubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SubscriptionStatus> => {
    const [subscription, usage] = await Promise.all([
      getSubscriptionRow(context.supabase, context.userId),
      getUsageRow(context.supabase, context.userId, todayStr()),
    ]);
    const plan = effectivePlan(subscription);
    return {
      plan,
      isPro: plan === "pro",
      status: subscription?.status ?? "active",
      currentPeriodEnd: subscription?.current_period_end ?? null,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
      limits: PLANS[plan].limits,
      usage: {
        ai_conversations: usage?.ai_conversations ?? 0,
        checkins: usage?.checkins ?? 0,
      },
      paddleCustomerId: subscription?.paddle_customer_id ?? null,
    };
  });

/**
 * Dev/ops-only helper to flip a user between Free and Pro.
 * Never enabled in production — guards on ALLOW_TEST_SUBSCRIPTION.
 */
export const setTestSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ plan: z.enum(["free", "pro"]) }).parse(v))
  .handler(async ({ data, context }) => {
    if (process.env.ALLOW_TEST_SUBSCRIPTION !== "true") {
      throw new Error("Test subscriptions are disabled.");
    }
    const { error } = await context.supabase.from("subscriptions").upsert(
      {
        user_id: context.userId,
        plan: data.plan,
        status: "active",
        current_period_end:
          data.plan === "pro" ? new Date(Date.now() + 365 * 864e5).toISOString() : null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, plan: data.plan as PlanId };
  });
