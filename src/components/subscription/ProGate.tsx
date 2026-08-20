"use client";

import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";

interface ProGateProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Renders children for Pro users; a premium upsell state for Free users.
 * Reused anywhere a Pro-only feature surfaces (AI insights, export, etc.).
 */
export function ProGate({
  children,
  title = "AI Health Insights",
  description = "Mood trends, summaries and deeper wellbeing analysis for your loved one.",
}: ProGateProps) {
  const { isPro, openPaywall } = useSubscriptionContext();

  if (isPro) return <>{children}</>;

  return (
    <div className="flex h-full flex-col items-center justify-center py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/30">
        <Crown className="h-7 w-7 text-white" fill="currentColor" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{description}</p>
      <Button size="sm" className="mt-4" onClick={() => openPaywall()}>
        <Lock className="h-3.5 w-3.5" /> Upgrade to Pro
      </Button>
    </div>
  );
}
