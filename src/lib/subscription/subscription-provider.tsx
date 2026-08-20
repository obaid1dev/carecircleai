"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSubscription } from "./subscription.functions";
import { handleUpgrade } from "./paddle";
import { isLimitError } from "./errors";
import {
  checkFeatureLimit,
  DEFAULT_LIMITS,
  DEFAULT_USAGE,
  PLANS,
  type BillingInterval,
  type FeatureKey,
  type Limits,
  type SubscriptionStatus,
} from "./plans";
import { PaywallModal } from "@/components/subscription/PaywallModal";

interface SubscriptionContextValue {
  subscription?: SubscriptionStatus;
  isPro: boolean;
  limits: Limits;
  usage: SubscriptionStatus["usage"];
  paddleCustomerId: string | null;
  openPaywall: (title?: string, subtitle?: string) => void;
  handleUpgrade: (billing?: BillingInterval) => Promise<void>;
  refresh: () => Promise<void>;
  /** Returns true when the action is allowed; opens the paywall when blocked. */
  guard: (feature: FeatureKey, used?: number) => boolean;
  isLimitError: (err: unknown) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [hasSession, setHasSession] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState<string>();
  const [paywallSubtitle, setPaywallSubtitle] = useState<string>();

  // Only fetch subscription state once we have a session — avoids firing the
  // authenticated server function on the public landing page / during SSR.
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setHasSession(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => getSubscription(),
    enabled: hasSession,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["subscription"] });
  }, [qc]);

  // Paddle emits this when checkout completes; refresh so Pro unlocks immediately.
  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener("carecircle:subscription-updated", handler);
    return () => window.removeEventListener("carecircle:subscription-updated", handler);
  }, [refresh]);

  const isPro = subscription?.isPro ?? false;
  const paddleCustomerId = subscription?.paddleCustomerId ?? null;
  const limits = useMemo(
    () => (subscription ? subscription.limits : DEFAULT_LIMITS),
    [subscription],
  );
  const usage = subscription?.usage ?? DEFAULT_USAGE;

  const openPaywall = useCallback((title?: string, subtitle?: string) => {
    setPaywallTitle(title);
    setPaywallSubtitle(subtitle);
    setPaywallOpen(true);
  }, []);

  const upgrade = useCallback(async (billing: BillingInterval = "monthly") => {
    await handleUpgrade(billing, paddleCustomerId);
  }, [paddleCustomerId]);

  const guard = useCallback(
    (feature: FeatureKey, used = 0) => {
      if (isPro) return true;
      const status = subscription ?? { plan: "free" as const, isPro: false };
      const allowed = checkFeatureLimit(feature, status, used);
      if (!allowed) {
        openPaywall(
          "Upgrade to CareCircleAI Pro",
          `You've reached your free limit. Upgrade for unlimited ${feature.replace(/_/g, " ")}.`,
        );
      }
      return allowed;
    },
    [isPro, subscription, openPaywall],
  );

  const value = useMemo<SubscriptionContextValue>(
    () => ({
      subscription,
      isPro,
      limits,
      usage,
      paddleCustomerId,
      openPaywall,
      handleUpgrade: upgrade,
      refresh,
      guard,
      isLimitError,
    }),
    [subscription, isPro, limits, usage, paddleCustomerId, openPaywall, upgrade, refresh, guard],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        title={paywallTitle}
        subtitle={paywallSubtitle}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  return ctx;
}
