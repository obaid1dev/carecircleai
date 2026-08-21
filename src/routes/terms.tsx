import { createFileRoute } from "@tanstack/react-router";
import { PublicPageLayout } from "@/components/PublicPageLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — CareCircle" },
      { name: "description", content: "Terms of Service for CareCircle." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PublicPageLayout
      title="Terms of Service"
      description="Effective date: August 21, 2026"
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using CareCircle ("the Service"), you agree to be bound by these Terms of
            Service ("Terms"). If you do not agree to these Terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of CareCircle</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle is an AI-powered care companion application designed to help families coordinate
            care for their elderly loved ones. The Service provides features including daily AI
            check-ins, medication tracking, appointment management, family and caregiver
            coordination, and an AI conversational companion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Account Registration</h2>
          <p className="text-muted-foreground leading-relaxed">
            To use CareCircle, you must create an account. You are responsible for maintaining the
            confidentiality of your account credentials and for all activity that occurs under your
            account. You agree to provide accurate and complete information during registration and to
            keep your information up to date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree to use CareCircle only for lawful purposes and in accordance with these Terms.
            You are responsible for all data you enter into the Service, including medication
            information, appointment details, and personal data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Acceptable Use</h2>
          <p className="text-muted-foreground leading-relaxed">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use the Service to transmit harmful or malicious content</li>
            <li>Automate access to the Service without our written permission</li>
            <li>Impersonate another person or entity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. AI-Generated Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle uses artificial intelligence to generate conversational responses, check-in
            summaries, health insights, and memory extraction. AI-generated content is produced by
            third-party language models and may contain inaccuracies. You should not rely on
            AI-generated content as the sole basis for any decision.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Medical and Wellness Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            <strong>CareCircle is not a doctor, healthcare provider, or emergency service.</strong>
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The Service is designed as a support and organization tool. It is not intended to
            diagnose, treat, cure, or prevent any medical condition. The Service does not provide
            medical advice, and any AI-generated responses should not be considered medical advice.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Always consult a qualified healthcare professional for medical concerns. If you or someone
            you care for is experiencing a medical emergency, call your local emergency services
            immediately.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle is not a replacement for professional medical care, and nothing in the Service
            should be interpreted as such.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Feature-Specific Terms</h2>

          <h3 className="text-lg font-medium mt-4 mb-2">Daily Check-Ins</h3>
          <p className="text-muted-foreground leading-relaxed">
            AI-powered daily check-ins are conversational interactions designed to help track general
            wellbeing. They are not clinical assessments and should not be used to make medical
            decisions.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Medication Tracking</h3>
          <p className="text-muted-foreground leading-relaxed">
            The medication tracking feature helps you organize and remember medication schedules. It
            does not verify drug interactions, contraindications, or dosages. Always follow the
            instructions of your healthcare provider regarding medications.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Appointment Management</h3>
          <p className="text-muted-foreground leading-relaxed">
            The appointment management feature helps you track and remember appointments. It is your
            responsibility to verify appointment details and attend scheduled appointments.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">AI Companion</h3>
          <p className="text-muted-foreground leading-relaxed">
            The AI companion feature provides conversational interaction and may remember information
            across sessions. While the AI is designed to be helpful and supportive, it is not a
            substitute for human companionship, therapy, or professional care.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Family and Caregiver Features</h3>
          <p className="text-muted-foreground leading-relaxed">
            Family and caregiver coordination features allow designated individuals to view care
            information. You are responsible for choosing who has access to this information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Subscriptions and Billing</h2>

          <h3 className="text-lg font-medium mt-4 mb-2">Free and Pro Plans</h3>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle offers a free tier with limited features and a paid "CareCircleAI Pro"
            subscription with unlimited access. Free plan limits include 1 daily check-in per day,
            up to 3 medications, 1 appointment, and up to 10 AI conversations per day.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Paddle Billing</h3>
          <p className="text-muted-foreground leading-relaxed">
            Subscriptions are processed through Paddle, our third-party payment processor. Paddle's
            terms of service and privacy policy apply to payment processing. By subscribing, you
            agree to Paddle's applicable terms.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Subscription Renewals</h3>
          <p className="text-muted-foreground leading-relaxed">
            Paid subscriptions renew automatically at the end of each billing period (monthly or
            annually, depending on your selection) unless you cancel before the renewal date.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Cancellation</h3>
          <p className="text-muted-foreground leading-relaxed">
            You may cancel your subscription at any time. Cancellation takes effect at the end of the
            current billing period. You will retain access to Pro features until that time. Please
            refer to our{" "}
            <a href="/refunds" className="text-primary underline">
              Refund &amp; Cancellation Policy
            </a>{" "}
            for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service, including its design, code, features, and content (excluding user-generated
            content), is owned by CareCircle and protected by intellectual property laws. You are
            granted a limited, non-exclusive, non-transferable license to use the Service for personal,
            non-commercial purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. User-Generated Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            You retain ownership of all data you enter into CareCircle. By using the Service, you
            grant us a limited license to process, store, and display your data as necessary to
            provide the Service. This includes sending your conversation messages to our AI provider
            (OpenRouter) to generate responses.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Service Availability</h2>
          <p className="text-muted-foreground leading-relaxed">
            We strive to keep CareCircle available at all times, but we do not guarantee uninterrupted
            access. The Service may be temporarily unavailable due to maintenance, updates, or factors
            beyond our control. We are not liable for any downtime or loss of access.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">13. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, CareCircle shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits or
            revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or
            other intangible losses resulting from your use of the Service.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            In no event shall our total liability exceed the amount you paid us in the twelve (12)
            months preceding the claim, or [LIMITATION AMOUNT REQUIRED] if no payments were made.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">14. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may suspend or terminate your access to the Service at any time, with or without
            notice, for conduct that we determine violates these Terms or is harmful to other users,
            third parties, or the business of CareCircle. Upon termination, your right to use the
            Service ceases immediately.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">15. Changes to the Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify, suspend, or discontinue any part of the Service at any
            time. We will make reasonable efforts to notify you of material changes. Your continued
            use of the Service after changes are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">16. Governing Law and Disputes</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms are governed by the laws of [JURISDICTION REQUIRED]. Any disputes arising
            from or relating to these Terms or the Service shall be resolved in the courts of
            [JURISDICTION REQUIRED].
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">17. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about these Terms, please visit our{" "}
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
