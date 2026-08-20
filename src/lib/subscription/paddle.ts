/**
 * Paddle Checkout — production checkout via Paddle v3.
 *
 * Configure via env vars (no code changes needed):
 *   VITE_PADDLE_VENDOR_ID          e.g. "live_xxxx"
 *   VITE_PADDLE_ENV                "production"
 *   VITE_PADDLE_PRICE_ID_MONTHLY   e.g. "pri_01xxxx"
 *   VITE_PADDLE_PRICE_ID_YEARLY    e.g. "pri_01xxxx"
 *
 * Every "Upgrade to Pro" button in the app calls `handleUpgrade()`.
 */
import type { BillingInterval } from "./plans";

const PADDLE_PRICE_IDS: Record<BillingInterval, string> = {
  monthly: import.meta.env.VITE_PADDLE_PRICE_ID_MONTHLY || "",
  yearly: import.meta.env.VITE_PADDLE_PRICE_ID_YEARLY || "",
};

interface PaddleConfig {
  vendorId: string;
  environment: "production";
  enabled: boolean;
}

function getPaddleConfig(): PaddleConfig {
  const vendorId = import.meta.env.VITE_PADDLE_VENDOR_ID || "";
  return { vendorId, environment: "production", enabled: Boolean(vendorId) };
}

type PaddleEvent = { name: string; data: unknown };
type PaddleCheckout = {
  open(options: {
    items: { priceId: string; quantity: number }[];
    settings: {
      displayMode: string;
      successUrl?: string;
      eventCallback?: (event: PaddleEvent) => void;
    };
  }): void;
};
type PaddleGlobal = {
  Initialize(options: {
    token: string;
    environment: string;
    eventCallback?: (event: PaddleEvent) => void;
    pwCustomer?: { id: string };
  }): void;
  Checkout: PaddleCheckout;
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

function loadPaddleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v3/paddle.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paddle.js"));
    document.head.appendChild(script);
  });
}

function onPaddleEvent(event: PaddleEvent): void {
  if (event.name === "checkout.completed") {
    // The Paddle webhook (/api/paddle/webhook) writes the subscription to
    // Supabase. Broadcast so the app can refresh plan state immediately.
    window.dispatchEvent(new CustomEvent("carecircle:subscription-updated"));
  }
}

export type UpgradeResult = { status: "opened" } | { status: "not_configured" };

export async function openPaddleCheckout(
  billing: BillingInterval,
  paddleCustomerId?: string | null,
): Promise<UpgradeResult> {
  const config = getPaddleConfig();
  const priceId = PADDLE_PRICE_IDS[billing];
  if (!config.enabled || !priceId) {
    console.info(
      "[CareCircle] Paddle checkout not configured. Set VITE_PADDLE_VENDOR_ID and " +
        "VITE_PADDLE_PRICE_ID_MONTHLY / VITE_PADDLE_PRICE_ID_YEARLY to enable.",
    );
    return { status: "not_configured" };
  }

  try {
    await loadPaddleScript();
    if (!window.Paddle) throw new Error("Paddle unavailable");
    window.Paddle.Initialize({
      token: config.vendorId,
      environment: config.environment,
      eventCallback: onPaddleEvent,
      ...(paddleCustomerId ? { pwCustomer: { id: paddleCustomerId } } : {}),
    });
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        displayMode: "overlay",
        successUrl: `${window.location.origin}/profile`,
        eventCallback: onPaddleEvent,
      },
    });
    return { status: "opened" };
  } catch (error) {
    console.error("[CareCircle] Paddle checkout failed:", error);
    return { status: "not_configured" };
  }
}

/** Single upgrade entry point — every Upgrade button calls this. */
export async function handleUpgrade(
  billing: BillingInterval = "monthly",
  paddleCustomerId?: string | null,
): Promise<UpgradeResult> {
  return openPaddleCheckout(billing, paddleCustomerId);
}
