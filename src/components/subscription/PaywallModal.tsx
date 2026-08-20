"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Crown, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/lib/subscription/plans";
import { handleUpgrade } from "@/lib/subscription/paddle";
import { toast } from "sonner";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";

const BENEFITS = [
  "Unlimited AI Conversations",
  "Unlimited Daily Check-ins",
  "Unlimited Medications",
  "Unlimited Appointments",
  "Unlimited Family Members",
  "AI Health Insights",
  "Export Health Reports",
  "Priority AI",
];

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  billing?: BillingInterval;
}

export function PaywallModal({
  open,
  onOpenChange,
  title = "Upgrade to CareCircleAI Pro",
  subtitle = "Unlock unlimited AI-powered caregiving.",
  billing = "monthly",
}: PaywallModalProps) {
  const { paddleCustomerId } = useSubscriptionContext();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  const upgrade = async () => {
    const result = await handleUpgrade(billing, paddleCustomerId);
    if (result.status === "not_configured") {
      toast.info("Secure checkout is coming soon. You'll be able to upgrade very shortly.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md cursor-default"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md max-h-[92dvh] overflow-x-hidden overflow-y-auto rounded-3xl border border-white/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-black/20"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-16 w-64 h-64 rounded-full bg-accent/25 blur-3xl pointer-events-none" />

            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative p-7 sm:p-8 text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", damping: 14 }}
                className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-accent-foreground flex items-center justify-center shadow-lg shadow-primary/30 mb-5"
              >
                <Crown className="w-10 h-10 text-white" fill="currentColor" />
              </motion.div>

              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              <p className="text-muted-foreground mt-1.5">{subtitle}</p>

              <div className="mt-6 text-left rounded-2xl border border-border bg-background/60 dark:bg-black/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Everything in Free, plus
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BENEFITS.map((b, i) => (
                    <motion.li
                      key={b}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={cn(
                          "shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center",
                        )}
                      >
                        <Check className="w-3 h-3" />
                      </span>
                      {b}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/25"
                  onClick={upgrade}
                >
                  <Crown className="w-4 h-4" />
                  Upgrade to Pro
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-11 rounded-xl"
                  onClick={() => onOpenChange(false)}
                >
                  Maybe Later
                </Button>
                <p className="text-xs text-muted-foreground pt-1">
                  Cancel anytime · Secure payments by Paddle
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
