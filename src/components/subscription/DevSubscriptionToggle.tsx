"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setTestSubscription } from "@/lib/subscription/subscription.functions";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";
import { Button } from "@/components/ui/button";

/**
 * Dev-only control to flip between Free and Pro (backed by the
 * ALLOW_TEST_SUBSCRIPTION server flag). Hidden in production builds.
 */
export function DevSubscriptionToggle() {
  const qc = useQueryClient();
  const { isPro } = useSubscriptionContext();

  const toggle = useMutation({
    mutationFn: () => setTestSubscription({ data: { plan: isPro ? "free" : "pro" } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });

  if (!import.meta.env.DEV) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      title="Dev-only: simulate a subscription (requires ALLOW_TEST_SUBSCRIPTION)"
    >
      {isPro ? "Dev: Set Free" : "Dev: Set Pro"}
    </Button>
  );
}
