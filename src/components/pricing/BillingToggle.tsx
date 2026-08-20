"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/lib/subscription/plans";

const OPTIONS: { value: BillingInterval; label: string; badge?: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly", badge: "Save 67%" },
];

interface BillingToggleProps {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
}

export function BillingToggle({ value, onChange }: BillingToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Billing period"
      className="relative inline-flex items-center rounded-full bg-secondary/80 p-1 text-sm font-medium"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors cursor-pointer",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 -z-10 rounded-full bg-card shadow-sm ring-1 ring-border"
                transition={{ type: "spring", damping: 28, stiffness: 400 }}
              />
            )}
            {opt.label}
            {opt.badge && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                  active ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary/80",
                )}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
