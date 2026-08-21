import { createFileRoute } from "@tanstack/react-router";
import { getUserFromRequest } from "@/integrations/supabase/request-user.server";

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || "";
const PADDLE_API_BASE = "https://api.paddle.com";

export const Route = createFileRoute("/api/paddle/portal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!PADDLE_API_KEY) {
          return new Response(
            JSON.stringify({ error: "Paddle API key not configured" }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        const user = await getUserFromRequest(request);
        if (!user) {
          return new Response(
            JSON.stringify({ error: "unauthorized" }),
            { status: 401, headers: { "content-type": "application/json" } },
          );
        }

        // Look up the paddle_customer_id from Supabase
        const { data: sub, error: subError } = await user.supabase
          .from("subscriptions")
          .select("paddle_customer_id")
          .eq("user_id", user.userId)
          .maybeSingle();

        if (subError || !sub?.paddle_customer_id) {
          return new Response(
            JSON.stringify({ error: "no_paddle_customer", message: "No Paddle customer found for this account." }),
            { status: 404, headers: { "content-type": "application/json" } },
          );
        }

        // Create a Paddle Customer Portal Session
        const origin = request.headers.get("origin") || new URL(request.url).origin;
        const response = await fetch(
          `${PADDLE_API_BASE}/customers/${sub.paddle_customer_id}/portal-sessions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${PADDLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              portal_navigation: {
                return_url: `${origin}/profile`,
              },
            }),
          },
        );

        if (!response.ok) {
          const body = await response.text();
          console.error(`[Paddle Portal] API error ${response.status}: ${body}`);
          return new Response(
            JSON.stringify({ error: "paddle_api_error", message: "Failed to create portal session." }),
            { status: 502, headers: { "content-type": "application/json" } },
          );
        }

        const result = await response.json() as {
          data?: { url?: string };
        };

        const portalUrl = result?.data?.url;
        if (!portalUrl) {
          console.error("[Paddle Portal] No URL in response:", JSON.stringify(result));
          return new Response(
            JSON.stringify({ error: "no_portal_url", message: "Portal session created but no URL returned." }),
            { status: 502, headers: { "content-type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ url: portalUrl }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
