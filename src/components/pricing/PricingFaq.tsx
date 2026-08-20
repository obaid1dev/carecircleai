"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Your subscription remains active until the current billing period ends.",
  },
  {
    q: "Can I switch between monthly and yearly?",
    a: "Yes. Upgrade or downgrade anytime.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. All family data is encrypted.",
  },
  {
    q: "When do I receive Pro features?",
    a: "Immediately after Paddle confirms payment.",
  },
];

export function PricingFaq() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5 }}
      className="mt-20"
    >
      <h3 className="text-center text-2xl sm:text-3xl font-bold tracking-tight">
        Billing questions, answered
      </h3>
      <p className="mt-2 text-center text-muted-foreground">
        Everything you need to know before you upgrade.
      </p>
      <Accordion type="single" collapsible className="mt-8 mx-auto max-w-2xl space-y-3">
        {FAQS.map((f) => (
          <AccordionItem
            key={f.q}
            value={f.q}
            className="rounded-2xl border border-border bg-card px-5 data-[state=open]:shadow-md transition-shadow"
          >
            <AccordionTrigger className="py-4 text-base font-medium [&[data-state=open]]:text-primary">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}
