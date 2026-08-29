import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getClientIp, isAllowedPaddleIp } from "@/lib/paddle/ip-allowlist";

const WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || "";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

/**
 * Verify Paddle webhook signature (HMAC-SHA256).
 * Paddle v3 signs the raw body with the endpoint secret key.
 */
async function verifySignature(body: string, paddleSignature: string): Promise<boolean> {
  if (!WEBHOOK_SECRET) {
    console.error("[Paddle Webhook] PADDLE_WEBHOOK_SECRET is not set — rejecting request");
    return false;
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Paddle sends comma-separated signatures; at least one must match
  const signatures = paddleSignature.split(",").map((s) => s.trim());
  return signatures.some((s) => s === expectedSignature);
}

interface PaddleEvent {
  event_id: string;
  event_type: string;
  data: Record<string, unknown>;
}

interface SubscriptionData {
  id: string;
  customer_id: string;
  price_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  [key: string]: unknown;
}

function parsePriceId(priceId: string): "pro" | null {
  const monthly = process.env.VITE_PADDLE_PRICE_ID_MONTHLY || "";
  const yearly = process.env.VITE_PADDLE_PRICE_ID_YEARLY || "";
  if (priceId === monthly || priceId === yearly) return "pro";
  return null;
}

async function handleSubscriptionCreated(data: SubscriptionData) {
  const supabase = getSupabaseAdmin();
  const plan = parsePriceId(data.price_id);

  // Look up the user by paddle_customer_id
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("paddle_customer_id", data.customer_id)
    .maybeSingle();

  if (!existing) {
    console.warn(`[Paddle Webhook] No user found for paddle_customer_id=${data.customer_id}`);
    return;
  }

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: existing.user_id,
      paddle_subscription_id: data.id,
      paddle_customer_id: data.customer_id,
      paddle_price_id: data.price_id,
      plan: plan || "free",
      status: data.status === "active" ? "active" : "inactive",
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[Paddle Webhook] Failed to upsert subscription:", error.message);
  }
}

async function handleSubscriptionUpdated(data: SubscriptionData) {
  const supabase = getSupabaseAdmin();
  const plan = parsePriceId(data.price_id);

  const { error } = await supabase
    .from("subscriptions")
    .update({
      paddle_price_id: data.price_id,
      plan: plan || "free",
      status: data.status === "active" ? "active" : "inactive",
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end,
      paddle_subscription_id: data.id,
    })
    .eq("paddle_subscription_id", data.id);

  if (error) {
    console.error("[Paddle Webhook] Failed to update subscription:", error.message);
  }
}

async function handleSubscriptionCancelled(data: SubscriptionData) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "inactive",
      cancel_at_period_end: true,
    })
    .eq("paddle_subscription_id", data.id);

  if (error) {
    console.error("[Paddle Webhook] Failed to cancel subscription:", error.message);
  }
}

async function handleSubscriptionPaused(data: SubscriptionData) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "paused" })
    .eq("paddle_subscription_id", data.id);

  if (error) {
    console.error("[Paddle Webhook] Failed to pause subscription:", error.message);
  }
}

async function handleSubscriptionResumed(data: SubscriptionData) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "active" })
    .eq("paddle_subscription_id", data.id);

  if (error) {
    console.error("[Paddle Webhook] Failed to resume subscription:", error.message);
  }
}

async function handleTransactionCompleted(data: Record<string, unknown>) {
  // When a transaction completes, ensure the subscription is active
  const subscriptionId = data.subscription_id as string | undefined;
  if (!subscriptionId) return;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "active" })
    .eq("paddle_subscription_id", subscriptionId);

  if (error) {
    console.error(
      "[Paddle Webhook] Failed to activate subscription on transaction:",
      error.message,
    );
  }
}

export const Route = createFileRoute("/api/paddle/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const paddleSignature = request.headers.get("paddle-signature") || "";

        if (!WEBHOOK_SECRET) {
          return new Response("Webhook secret not configured", { status: 500 });
        }

        // IP allowlist check (secondary defense — HMAC signature is primary)
        const clientIp = getClientIp(request);
        if (!isAllowedPaddleIp(clientIp)) {
          console.warn(`[Paddle Webhook] Blocked request from non-Paddle IP: ${clientIp}`);
          return new Response("Forbidden", { status: 403 });
        }

        const isValid = await verifySignature(rawBody, paddleSignature);
        if (!isValid) {
          console.warn("[Paddle Webhook] Invalid signature — rejecting");
          return new Response("Invalid signature", { status: 401 });
        }

        let event: PaddleEvent;
        try {
          event = JSON.parse(rawBody) as PaddleEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        console.info(`[Paddle Webhook] Received event: ${event.event_type} (${event.event_id})`);

        try {
          switch (event.event_type) {
            case "subscription.created":
              await handleSubscriptionCreated(event.data as SubscriptionData);
              break;
            case "subscription.updated":
              await handleSubscriptionUpdated(event.data as SubscriptionData);
              break;
            case "subscription.cancelled":
              await handleSubscriptionCancelled(event.data as SubscriptionData);
              break;
            case "subscription.paused":
              await handleSubscriptionPaused(event.data as SubscriptionData);
              break;
            case "subscription.resumed":
              await handleSubscriptionResumed(event.data as SubscriptionData);
              break;
            case "transaction.completed":
              await handleTransactionCompleted(event.data);
              break;
            default:
              console.info(`[Paddle Webhook] Unhandled event type: ${event.event_type}`);
          }
        } catch (error) {
          console.error(`[Paddle Webhook] Error processing ${event.event_type}:`, error);
          return new Response("Processing error", { status: 500 });
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
