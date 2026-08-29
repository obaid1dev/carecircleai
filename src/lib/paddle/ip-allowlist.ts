/**
 * Paddle webhook IP allowlist.
 *
 * Paddle publishes their outgoing IPs at https://api.paddle.com/ips
 * Current (as of audit): 34.237.3.244/32, 34.195.105.136/32, 34.232.58.13/32,
 *   35.155.119.135/32, 34.212.5.7/32, 52.11.166.252/32
 *
 * For production, the recommended approach is:
 *
 * 1. PRIMARY: Always verify Paddle's HMAC-SHA256 signature on every webhook.
 *    This is already implemented in the webhook handler.
 *
 * 2. SECONDARY (defense in depth): Restrict incoming IPs to Paddle's ranges.
 *
 *    Option A (Cloudflare Workers / Lovable deploy):
 *      Configure Cloudflare WAF rules or IP Access Rules to allow only
 *      Paddle's IP CIDRs on the /api/paddle/webhook path. This is the
 *      simplest approach — no code changes needed.
 *
 *    Option B (Nitro middleware):
 *      If deploying to a Nitro-compatible environment, add a server
 *      middleware that checks request IP against these CIDRs before
 *      the handler runs. This is implemented below as a ready-to-use
 *      utility.
 *
 *    Option C (Supabase Edge Function):
 *      If the webhook runs as a Supabase Edge Function, add an IP
 *      check at the top of the function handler.
 *
 * IMPORTANT: Do NOT hard-code IP lists that may become stale.
 * Fetch from https://api.paddle.com/ips periodically or rely on
 * Cloudflare's managed rules.
 */

// Known Paddle LIVE IPv4 CIDRs — refreshed from https://api.paddle.com/ips
// If you need to update, fetch the latest from the URL above.
const PADDLE_IPV4_CIDRS = [
  "34.237.3.244/32",
  "34.195.105.136/32",
  "34.232.58.13/32",
  "35.155.119.135/32",
  "34.212.5.7/32",
  "52.11.166.252/32",
];

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function cidrToRange(cidr: string): { start: number; end: number } {
  const [ip, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);
  const ipLong = ipToLong(ip);
  const mask = (~0 << (32 - prefix)) >>> 0;
  const start = (ipLong & mask) >>> 0;
  const end = (ipLong | (~mask >>> 0)) >>> 0;
  return { start, end };
}

const PADDLE_RANGES = PADDLE_IPV4_CIDRS.map(cidrToRange);

export function isAllowedPaddleIp(ip: string): boolean {
  // Allow localhost / private IPs in development
  if (
    process.env.NODE_ENV !== "production" &&
    (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10."))
  ) {
    return true;
  }

  const ipLong = ipToLong(ip);
  return PADDLE_RANGES.some(({ start, end }) => ipLong >= start && ipLong <= end);
}

/**
 * Extract the real client IP from a request.
 * Handles X-Forwarded-For (Cloudflare / reverse proxy) and X-Real-IP.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}
