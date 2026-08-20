/**
 * Single source of truth for plan limits and pricing.
 *
 * Add a future plan by extending `PlanId`, defining its limits here, and —
 * if it changes feature gating — updating the comparison table data. No other
 * code needs to change.
 */

export type PlanId = "free" | "pro";

export type BillingInterval = "monthly" | "yearly";

export type FeatureKey =
  | "daily_checkins"
  | "ai_conversations"
  | "medications"
  | "appointments"
  | "family_members"
  | "ai_health_insights"
  | "export_reports"
  | "priority_ai"
  | "priority_support";

export const UNLIMITED = Infinity;

export type Limits = Record<FeatureKey, number>;

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  limits: Limits;
  included: string[];
  notIncluded: string[];
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Perfect for trying CareCircleAI.",
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      daily_checkins: 1,
      ai_conversations: 10,
      medications: 3,
      appointments: 1,
      family_members: 1,
      ai_health_insights: 0,
      export_reports: 0,
      priority_ai: 0,
      priority_support: 0,
    },
    included: [
      "1 AI Daily Check-in per day",
      "Up to 3 Medications",
      "1 Appointment",
      "AI Chat (limited to 10/day)",
      "Medication reminders",
      "Appointment reminders",
      "Family dashboard",
      "Secure cloud sync",
    ],
    notIncluded: [
      "Unlimited AI Conversations",
      "Unlimited Medications",
      "Unlimited Appointments",
      "Unlimited Family Members",
      "AI Health Insights",
      "Export Health Reports",
      "Priority AI Responses",
      "Priority Support",
    ],
  },
  pro: {
    id: "pro",
    name: "CareCircleAI Pro",
    tagline: "Unlimited AI-powered caregiving.",
    priceMonthly: 9.99,
    priceYearly: 39.99,
    limits: {
      daily_checkins: UNLIMITED,
      ai_conversations: UNLIMITED,
      medications: UNLIMITED,
      appointments: UNLIMITED,
      family_members: UNLIMITED,
      ai_health_insights: UNLIMITED,
      export_reports: UNLIMITED,
      priority_ai: UNLIMITED,
      priority_support: UNLIMITED,
    },
    included: [
      "Unlimited AI Daily Check-ins",
      "Unlimited AI Conversations",
      "Unlimited Medications",
      "Unlimited Appointments",
      "Unlimited Reminder Notifications",
      "Unlimited Family Members",
      "AI Health Insights & Summaries",
      "Export Health Reports",
      "Priority AI Responses",
      "Priority Support",
      "Early Access to New Features",
    ],
    notIncluded: [],
  },
};

export const DEFAULT_LIMITS: Limits = PLANS.free.limits;

export function isProPlan(plan: PlanId): boolean {
  return plan === "pro";
}

export function isUnlimited(limit: number): boolean {
  return limit === UNLIMITED;
}

export interface UsageCounters {
  ai_conversations: number;
  checkins: number;
}

export const DEFAULT_USAGE: UsageCounters = {
  ai_conversations: 0,
  checkins: 0,
};

export interface SubscriptionStatus {
  plan: PlanId;
  isPro: boolean;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: Limits;
  usage: UsageCounters;
  paddleCustomerId: string | null;
}

/** True when the feature is available to this subscription for the given current usage. */
export function checkFeatureLimit(
  feature: FeatureKey,
  status: Pick<SubscriptionStatus, "plan" | "isPro">,
  used = 0,
): boolean {
  if (status.isPro) return true;
  const limit = PLANS.free.limits[feature];
  return used < limit;
}

/** Human-readable usage label, e.g. "You've used 8 of 10 AI chats today." */
export function usageLabel(feature: FeatureKey, used: number): string {
  const limit = PLANS.free.limits[feature];
  const base: Record<FeatureKey, string> = {
    daily_checkins: "daily check-ins",
    ai_conversations: "AI chats",
    medications: "medications",
    appointments: "appointments",
    family_members: "family members",
    ai_health_insights: "AI health insights",
    export_reports: "health report exports",
    priority_ai: "priority AI responses",
    priority_support: "priority support",
  };
  if (isUnlimited(limit)) return `Unlimited ${base[feature]}`;
  return `You've used ${Math.min(used, limit)} of ${limit} ${base[feature]}.`;
}
