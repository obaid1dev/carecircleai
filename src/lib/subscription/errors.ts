import type { FeatureKey } from "./plans";

export const LIMIT_REACHED_PREFIX = "LIMIT_REACHED:";

/** Error thrown by server handlers when a Free plan limit is exceeded. */
export class SubscriptionLimitError extends Error {
  feature: FeatureKey;
  constructor(feature: FeatureKey, message: string) {
    super(`${LIMIT_REACHED_PREFIX}${message}`);
    this.name = "SubscriptionLimitError";
    this.feature = feature;
  }
}

/** Produces the wire-safe message a handler should throw when a limit is hit. */
export function limitReachedMessage(message: string): string {
  return `${LIMIT_REACHED_PREFIX}${message}`;
}

/** Detects whether an error (from a server function or API) is a plan-limit error. */
export function isLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.message.startsWith(LIMIT_REACHED_PREFIX);
}
