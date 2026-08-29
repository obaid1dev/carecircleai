import { createFileRoute } from "@tanstack/react-router";
import { PublicPageLayout } from "@/components/PublicPageLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About CareCircle" },
      {
        name: "description",
        content: "Learn about CareCircle, an AI-powered care companion for seniors.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicPageLayout
      title="About CareCircle"
      description="An AI-powered care companion helping families care, even from afar."
    >
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-xl font-semibold mb-3">What is CareCircle?</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle is an AI-powered care companion application designed to help families
            coordinate care for their elderly loved ones. It combines daily AI-powered check-ins,
            medication tracking, appointment management, and family coordination into a single,
            easy-to-use platform.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The goal of CareCircle is simple: provide peace of mind for families and gentle,
            consistent support for seniors — even when loved ones can't be there in person.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Who is CareCircle For?</h2>
          <p className="text-muted-foreground leading-relaxed">CareCircle is designed for:</p>
          <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2">
            <li>
              <strong>Seniors</strong> who want a friendly, daily companion that helps them stay on
              track with medications and appointments
            </li>
            <li>
              <strong>Family members and caregivers</strong> who want to stay informed about their
              loved one's wellbeing, even from a distance
            </li>
            <li>
              <strong>Anyone coordinating care</strong> for an aging parent, grandparent, or other
              loved one
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Key Features</h2>

          <h3 className="text-lg font-medium mt-4 mb-2">Daily AI Check-Ins</h3>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle checks in with your loved one each day through a friendly AI conversation. It
            asks about how they're feeling, whether they slept well, if they've taken their
            medications, and anything else on their mind. Responses are summarized and shared with
            family members.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Medication Tracking</h3>
          <p className="text-muted-foreground leading-relaxed">
            Keep track of all medications in one place. CareCircle helps manage medication schedules
            and sends reminders so nothing is missed.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Appointment Management</h3>
          <p className="text-muted-foreground leading-relaxed">
            Never miss a doctor's appointment. CareCircle stores appointment details and sends
            timely reminders.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Family and Caregiver Coordination</h3>
          <p className="text-muted-foreground leading-relaxed">
            Family members and caregivers can view a shared dashboard showing check-in summaries,
            medication adherence, upcoming appointments, and alerts — keeping everyone on the same
            page.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">AI Companion</h3>
          <p className="text-muted-foreground leading-relaxed">
            The AI companion remembers conversations and personal details across sessions, creating
            a more natural and personalized experience over time.
          </p>

          <h3 className="text-lg font-medium mt-4 mb-2">Smart Alerts</h3>
          <p className="text-muted-foreground leading-relaxed">
            When something needs attention — a missed check-in, a concerning response, or an
            upcoming appointment — CareCircle alerts the right people.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Not a Medical Device</h2>
          <p className="text-muted-foreground leading-relaxed">
            CareCircle is a support and organization tool. It is not a medical device, not a
            healthcare provider, and not a substitute for professional medical advice, diagnosis, or
            treatment. Always consult a qualified healthcare professional for medical concerns.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe that staying connected with aging loved ones should be easy, even across
            distances. CareCircle aims to bridge the gap between families and their elderly members
            through thoughtful, AI-assisted care coordination.
          </p>
        </section>
      </div>
    </PublicPageLayout>
  );
}
