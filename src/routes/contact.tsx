import { createFileRoute } from "@tanstack/react-router";
import { PublicPageLayout } from "@/components/PublicPageLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — CareCircle" },
      { name: "description", content: "Get in touch with the CareCircle team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PublicPageLayout
      title="Contact Us"
      description="We'd love to hear from you. Here's how to reach us."
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">Get in Touch</h2>
          <p className="text-muted-foreground leading-relaxed">
            Whether you have a question about CareCircle, need help with your subscription, or want
            to share feedback, we're here to help.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Email</h2>
          <p className="text-muted-foreground leading-relaxed">
            You can reach us at:{" "}
            <a href="mailto:help.carecircle@gmail.com" className="text-primary underline">
              help.carecircle@gmail.com
            </a>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We aim to respond within 2 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">What We Can Help With</h2>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
            <li>Account and subscription questions</li>
            <li>Billing and payment issues</li>
            <li>Technical support</li>
            <li>Feedback and feature requests</li>
            <li>Data deletion requests</li>
            <li>Privacy-related inquiries</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Emergency Notice</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle is not an emergency service. If you or someone you care for is experiencing a
            medical emergency, please call your local emergency services immediately.
          </p>
        </section>
      </div>
    </PublicPageLayout>
  );
}
