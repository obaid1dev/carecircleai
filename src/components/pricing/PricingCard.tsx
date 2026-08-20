"use client";

import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Check, X, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillingToggle } from "./BillingToggle";
import { cn } from "@/lib/utils";
import { handleUpgrade } from "@/lib/subscription/paddle";
import { toast } from "sonner";
import type { BillingInterval, PlanDefinition } from "@/lib/subscription/plans";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";

interface PricingCardProps {
  plan: PlanDefinition;
  billing: BillingInterval;
  onBillingChange: (billing: BillingInterval) => void;
  index: number;
}

export function PricingCard({ plan, billing, onBillingChange, index }: PricingCardProps) {
  const isPro = plan.id === "pro";
  const { paddleCustomerId } = useSubscriptionContext();

  const onUpgrade = async () => {
    const result = await handleUpgrade(billing, paddleCustomerId);
    if (result.status === "not_configured") {
      toast.info("Secure checkout is coming soon. You'll be able to upgrade very shortly.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
      className="h-full"
    >
      <div
        className={cn(
          "relative h-full rounded-3xl transition-transform duration-300 hover:-translate-y-1.5",
          isPro &&
            "p-[1.5px] bg-gradient-to-br from-primary via-emerald-400 to-accent-foreground shadow-xl shadow-primary/25",
        )}
      >
        {isPro && (
          <>
            <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-br from-primary/40 to-accent-foreground/30 blur-lg -z-10" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-emerald-600 px-3.5 py-1 text-xs font-semibold text-white shadow-md shadow-primary/30">
              <Star className="w-3.5 h-3.5 fill-current" />
              Most Popular
            </div>
          </>
        )}
        <div
          className={cn(
            "relative flex h-full flex-col rounded-3xl p-6 sm:p-7",
            isPro ? "bg-card/95 backdrop-blur-sm" : "border border-border bg-card",
          )}
        >
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              {isPro && <Crown className="w-5 h-5 text-primary" fill="currentColor" />}
              {plan.name}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>

          {isPro && (
            <div className="mt-4">
              <BillingToggle value={billing} onChange={onBillingChange} />
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight">
              {isPro ? (billing === "monthly" ? "$9.99" : "$39.99") : "$0"}
            </span>
            <span className="text-muted-foreground">
              {isPro ? (billing === "monthly" ? "/month" : "/year") : "forever"}
            </span>
          </div>
          {isPro && billing === "yearly" && (
            <p className="mt-1 text-sm font-medium text-primary">Save 67% with yearly billing</p>
          )}

          <div className="mt-6 flex-1 space-y-2.5">
            {plan.included.map((f) => (
              <Feature key={f} included>
                {f}
              </Feature>
            ))}
            {plan.notIncluded.map((f) => (
              <Feature key={f} included={false}>
                {f}
              </Feature>
            ))}
          </div>

          <div className="mt-7">
            {isPro ? (
              <Button
                size="lg"
                onClick={onUpgrade}
                className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full h-12 rounded-xl text-base"
              >
                <Link to="/auth">Start Free</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Feature({ children, included }: { children: React.ReactNode; included: boolean }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      {included ? (
        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Check className="w-3 h-3" />
        </span>
      ) : (
        <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-muted text-muted-foreground/60 flex items-center justify-center">
          <X className="w-3 h-3" />
        </span>
      )}
      <span
        className={
          included
            ? "text-foreground"
            : "text-muted-foreground line-through decoration-muted-foreground/40"
        }
      >
        {children}
      </span>
    </div>
  );
}
