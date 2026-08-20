"use client";

import { motion } from "framer-motion";
import { Heart, ShieldCheck, RotateCcw, Lock, FileText } from "lucide-react";

const BADGES = [
  { icon: ShieldCheck, label: "Secure Payments by Paddle" },
  { icon: RotateCcw, label: "Cancel Anytime" },
  { icon: Lock, label: "No Hidden Fees" },
  { icon: FileText, label: "Privacy First" },
];

export function TrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-14 text-center"
    >
      <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <Heart className="w-4 h-4 text-primary" fill="currentColor" />
        Trusted by families caring for loved ones
        <Heart className="w-4 h-4 text-primary" fill="currentColor" />
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {BADGES.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
          >
            <b.icon className="w-4 h-4 text-primary" />
            {b.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
