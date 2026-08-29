import { createFileRoute } from "@tanstack/react-router";
import { PublicPageLayout } from "@/components/PublicPageLayout";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy — CareCircle" },
      {
        name: "description",
        content: "Refund and cancellation policy for CareCircle subscriptions.",
      },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <PublicPageLayout
      title="Refund &amp; Cancellation Policy"
      description="Effective date: August 21, 2026"
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle offers both free and paid subscription plans. This policy explains how to
            cancel your subscription and what to expect regarding refunds.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Subscription Plans</h2>

          <h3 className="text-lg font-medium mt-4 mb-2">Free Plan</h3>
          <p className="text-muted-foreground leading-relaxed">
            The free plan is available at no cost and includes limited features: 1 daily check-in
            per day, up to 3 medications, 1 appointment, and up to 10 AI conversations per day.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">CareCircleAI Pro — Monthly</h3>
          <p className="text-muted-foreground leading-relaxed">
            Billed at $9.99 per month. Provides unlimited access to all features.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">CareCircleAI Pro — Annual</h3>
          <p className="text-muted-foreground leading-relaxed">
            Billed at $39.99 per year. Provides unlimited access to all features at a reduced rate.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How to Cancel</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may cancel your subscription at any time through your CareCircle profile page under
            the subscription settings. You can also contact us for assistance with cancellation.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Cancellation takes effect at the end of your current billing period. You will retain
            access to Pro features until the end of the period for which you have already paid.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. After Cancellation</h2>
          <p className="text-muted-foreground leading-relaxed">Once your subscription ends:</p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
            <li>Your account will revert to the free plan</li>
            <li>You will retain access to your data within free plan limits</li>
            <li>
              If you exceed free plan limits (e.g., more than 3 medications), you will not be able
              to add more until you reduce your usage or resubscribe
            </li>
            <li>Your conversation history, memories, and check-in data remain intact</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Refunds</h2>
          <p className="text-muted-foreground leading-relaxed">
            [REFUND TERMS REQUIRED — Please specify your refund policy here, such as whether you
            offer refunds within a certain number of days of purchase, or on a case-by-case basis.]
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you believe you have been charged incorrectly, please contact us so we can
            investigate and resolve the issue.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Duplicate or Incorrect Charges</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you believe you have been charged more than once for the same subscription period, or
            charged in error, please contact us immediately. We will work with Paddle to investigate
            and resolve any billing discrepancies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Failed Payments</h2>
          <p className="text-muted-foreground leading-relaxed">
            If a payment fails, Paddle (our payment processor) may retry the charge. If the payment
            cannot be processed after multiple attempts, your subscription may be cancelled
            automatically, and your account will revert to the free plan.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Refund &amp; Cancellation Policy from time to time. Changes will be
            posted on this page with an updated effective date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this policy or need help with your subscription, please
            visit our{" "}
            <a href="/contact" className="text-primary underline">
              Contact page
            </a>{" "}
            or reach out to us at help.carecircle@gmail.com.
          </p>
        </section>
      </div>
    </PublicPageLayout>
  );
}
