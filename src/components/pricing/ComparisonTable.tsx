"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Cell = string | boolean;

const ROWS: { feature: string; free: Cell; pro: Cell }[] = [
  { feature: "AI Daily Check-ins", free: "1/day", pro: "Unlimited" },
  { feature: "AI Conversations", free: "10/day", pro: "Unlimited" },
  { feature: "Medications", free: "3", pro: "Unlimited" },
  { feature: "Appointments", free: "1", pro: "Unlimited" },
  { feature: "Medication Reminders", free: true, pro: true },
  { feature: "Appointment Reminders", free: true, pro: true },
  { feature: "Family Dashboard", free: true, pro: true },
  { feature: "Family Members", free: "1", pro: "Unlimited" },
  { feature: "AI Health Insights", free: false, pro: true },
  { feature: "Export Reports", free: false, pro: true },
  { feature: "Priority AI", free: false, pro: true },
  { feature: "Priority Support", free: false, pro: true },
];

export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-4 text-sm font-semibold text-muted-foreground">
                Feature
              </th>
              <th className="w-32 px-5 py-4 text-center text-sm font-medium text-muted-foreground">
                Free
              </th>
              <th className="w-32 px-5 py-4 text-center text-sm font-semibold bg-primary/5 text-primary">
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <motion.tr
                key={row.feature}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className={cn(
                  "border-b border-border last:border-0",
                  i % 2 === 1 ? "bg-secondary/40" : "",
                )}
              >
                <td className="px-5 py-3.5 text-sm font-medium">{row.feature}</td>
                <td className="px-5 py-3.5 text-center">
                  <CellView value={row.free} muted />
                </td>
                <td className="px-5 py-3.5 text-center bg-primary/5">
                  <CellView value={row.pro} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellView({ value, muted }: { value: Cell; muted?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="w-3.5 h-3.5" />
      </span>
    ) : (
      <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
        <X className="w-3.5 h-3.5" />
      </span>
    );
  }
  return (
    <span className={cn("text-sm", muted ? "text-muted-foreground" : "font-semibold text-primary")}>
      {value}
    </span>
  );
}
