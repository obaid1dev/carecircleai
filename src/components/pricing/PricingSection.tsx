"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PLANS, type BillingInterval } from "@/lib/subscription/plans";
import { PricingCard } from "./PricingCard";
import { ComparisonTable } from "./ComparisonTable";
import { TrustBadges } from "./TrustBadges";
import { PricingFaq } from "./PricingFaq";

export function PricingSection() {
  const [billing, setBilling] = useState<BillingInterval>("monthly");

  return (
    <section id="pricing" className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/20 blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Simple pricing for every family
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Supporting your loved ones should be simple. Start free and upgrade whenever you need
            unlimited care.
          </p>
        </motion.div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 items-stretch">
          <PricingCard plan={PLANS.free} billing={billing} onBillingChange={setBilling} index={0} />
          <PricingCard plan={PLANS.pro} billing={billing} onBillingChange={setBilling} index={1} />
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <h3 className="mb-6 text-center text-2xl font-bold tracking-tight">
            Compare every feature
          </h3>
          <ComparisonTable />
        </div>

        <TrustBadges />
        <PricingFaq />
      </div>
    </section>
  );
}
