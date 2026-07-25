import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { MessageCircle, Pill, Calendar, ShieldAlert, Users, Heart, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { useTheme } from "@/lib/theme-provider";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareCircle — Helping families care, even from afar" },
      {
        name: "description",
        content:
          "AI companion and caregiver coordination for seniors. Daily check-ins, medication reminders, and mood monitoring that keeps families informed.",
      },
      { property: "og:title", content: "CareCircle — Helping families care, even from afar" },
      {
        property: "og:description",
        content:
          "Daily AI check-ins, medication reminders, and family alerts. An early warning system that supports seniors and their loved ones.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // Check user's active role to redirect to appropriate view
      const { data: profile } = await supabase.from("profiles").select("active_role").eq("id", data.user.id).maybeSingle();
      const role = profile?.active_role || "senior";
      throw redirect({ to: role === "caregiver" ? "/family" : "/dashboard" });
    }
  },
  component: Landing,
});

function Landing() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <img src="/logo.png" alt="CareCircle" className="w-6 h-6" />
          CareCircle
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-warm/10 blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm text-warm-foreground text-sm mb-6">
            <img src="/logo.png" alt="CareCircle" className="w-4 h-4" />
            AI companion for seniors
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Helping families care, <span className="text-primary">even from afar.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            CareCircle checks in with your loved one every day, remembers their medications and
            appointments, and quietly lets you know when something needs your attention.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Start caring today</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">I'm a family member</Link>
            </Button>
          </div>
        </div>
        <div className="bg-card border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="CareCircle" className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">CareCircle</p>
              <p className="text-xs text-muted-foreground">Daily check-in · 9:02 AM</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm">
              Good morning Mary 🌞 How are you feeling today?
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl rounded-tr-sm ml-8">
              A little dizzy this morning, but I took my pills.
            </div>
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm">
              I'm glad you took them. Would you like me to let your daughter know about the
              dizziness?
            </div>
          </div>
        </div>
      </section>

      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              See how it works <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none text-primary">
                Daily Check-in
              </span>
            </h1>
          </>
        }
      >
        <div className="mx-auto rounded-2xl bg-card border shadow-xl overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <img src="/logo.png" alt="CareCircle" className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">CareCircle</p>
              <p className="text-xs text-muted-foreground">Daily check-in · 9:02 AM</p>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[30rem] overflow-y-auto scrollbar-hide">
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              Good morning Mary 🌞 How are you feeling today?
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]">
              A little dizzy this morning, but I took my pills.
            </div>
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              I'm glad you took them. Would you like me to let your daughter know about the
              dizziness?
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]">
              Yes please, she worries.
            </div>
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              Done! I've sent her a gentle update. Your blood pressure reading from yesterday
              looked good too — 118/76.
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]">
              That's a relief. Thank you for checking on me.
            </div>
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              Always. Remember your 10 AM medications — Lisinopril and Metformin. I'll check
              back this afternoon!
            </div>
          </div>
        </div>
      </ContainerScroll>

      <section className="bg-secondary/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            One gentle app. Peace of mind for the whole family.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: MessageCircle,
                title: "Daily AI check-in",
                desc: "A warm conversation each morning to see how they're doing.",
              },
              {
                icon: Pill,
                title: "Medication reminders",
                desc: "Never miss a dose. Adherence is tracked for the family.",
              },
              {
                icon: Calendar,
                title: "Appointment tracking",
                desc: "Doctor visits stay on the calendar for everyone.",
              },
              {
                icon: ShieldAlert,
                title: "Smart alerts",
                desc: "Family is notified early if something seems off.",
              },
              {
                icon: Users,
                title: "Family dashboard",
                desc: "Mood trends, summaries, and a shared view of wellbeing.",
              },
              {
                icon: Heart,
                title: "Never replaces care",
                desc: "An early warning system, not a diagnosis. Always kind.",
              },
            ].map((f) => (
              <div key={f.title} className="bg-card p-6 rounded-2xl border">
                <f.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about how CareCircle works for your
              family.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How does the daily check-in work?",
                a: "Every morning, CareCircle sends a gentle, conversational check-in via text or the app. It asks simple questions about mood, sleep, medications, and any concerns. Responses are summarized for family members in a daily digest.",
              },
              {
                q: "Is CareCircle a medical device?",
                a: "No. CareCircle is a wellbeing and communication tool, not a medical device. It does not diagnose, treat, or monitor medical conditions. Always consult a healthcare professional for medical concerns.",
              },
              {
                q: "How is my loved one's privacy protected?",
                a: "All conversations are encrypted end-to-end. Health data is HIPAA-compliant and never shared outside the care circle you define. You control exactly who sees what — and can revoke access anytime.",
              },
              {
                q: "How do medication reminders work?",
                a: "You (or a pharmacist) set up the schedule once. CareCircle sends gentle reminders at the right times and logs when doses are taken. Missed doses trigger a gentle follow-up and optional family notification.",
              },
              {
                q: "What happens if something seems wrong?",
                a: "CareCircle watches for patterns — missed check-ins, concerning symptoms, mood changes — and sends a gentle 'heads up' to the family contact you choose. It's an early warning, not an alarm.",
              },
              {
                q: "How much does it cost?",
                a: "CareCircle offers a free tier for basic check-ins. Family plans start at $19/month and include unlimited check-ins, medication tracking, appointment sync, and the family dashboard. No contracts, cancel anytime.",
              },
              {
                q: "Can multiple family members be on the same account?",
                a: "Yes. The Family plan supports up to 6 caregivers and unlimited care recipients. Everyone gets the shared dashboard, and you can customize who receives which types of notifications.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-card border border-border rounded-xl p-5 open:shadow-lg transition-shadow"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-lg">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p className="text-muted-foreground mt-4 text-base leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-muted/30 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <img src="/logo.png" alt="CareCircle" className="w-5 h-5" />
                </div>
                <span className="font-semibold text-xl">CareCircle</span>
              </div>
              <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
                Gentle daily check-ins for aging loved ones. Peace of mind for the
                whole family.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Daily Check-in</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Medication Tracking</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Family Dashboard</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Smart Alerts</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()} CareCircle. Not a medical device. Always consult a
                healthcare professional.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
