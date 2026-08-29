import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { PricingSection } from "@/components/pricing/PricingSection";
import { FaqSection } from "@/components/ui/faq-section";
import { GradientCard } from "@/components/ui/gradient-card";
import { PhoneCall, Pill, LayoutDashboard, BellRing } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const LANDING_FAQS = [
  {
    question: "What is CareCircle?",
    answer:
      "CareCircle is a gentle companion app for seniors, with a dashboard for family. Your loved one gets a friendly daily AI check-in; you get medication tracking, mood trends, and early alerts — all in one shared view.",
  },
  {
    question: "Who is it for?",
    answer:
      "Older adults who want to stay independent at home, and the family members who worry about them — especially when distance means you can't check in person every day.",
  },
  {
    question: "How does the daily check-in work?",
    answer:
      "Each morning, the AI companion calls or chats briefly to ask how they're feeling, whether they've taken medications, and what's planned for the day. It takes just a few minutes.",
  },
  {
    question: "Does it replace my parent's doctor?",
    answer:
      "No. CareCircle is an early warning system, not a medical device. It notices patterns worth mentioning and keeps the family informed — always consult healthcare professionals about medical decisions.",
  },
  {
    question: "Is our data private and secure?",
    answer:
      "Yes. Family data is encrypted in transit and at rest, and stays inside your family circle. We never sell your information.",
  },
  {
    question: "What's included in Pro?",
    answer:
      "Pro unlocks unlimited daily check-ins, AI-generated health summaries for the family, and deeper mood and adherence insights. Everything essential — reminders, alerts, and the family dashboard — stays free.",
  },
  {
    question: "When do I get Pro features after paying?",
    answer:
      "Immediately. As soon as Paddle confirms your payment, every Pro feature unlocks on your account — no waiting, no restart.",
  },
  {
    question: "Can I switch between monthly and yearly billing?",
    answer: "Yes, upgrade or downgrade anytime from your profile. Yearly billing saves about 67%.",
  },
  {
    question: "Can I cancel Pro anytime?",
    answer:
      "Absolutely. Cancel in one click from your profile — your subscription stays active until the end of the current billing period.",
  },
];

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
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("id", data.user.id)
        .maybeSingle();
      const role = profile?.active_role || "senior";
      throw redirect({ to: role === "caregiver" ? "/family" : "/dashboard" });
    }
  },
  component: Landing,
});

function Landing() {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onHashChange = () => {
      const id = window.location.hash.slice(1);
      if (id) {
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        });
      }
    };
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lift"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-semibold text-lg tracking-tight rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img src="/logo.png" alt="CareCircle" className="h-8 w-8" />
            <span className="hidden sm:inline">CareCircle</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="shrink-0 rounded-full"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button asChild variant="ghost" className="px-3 sm:px-4">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="px-3 sm:px-4">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-blob" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-warm/10 blur-3xl animate-blob animation-delay-4000" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm text-warm-foreground text-sm font-semibold shadow-sm">
              <img src="/logo.png" alt="" aria-hidden="true" className="w-4 h-4" />
              AI companion for seniors
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mt-4">
              Helping families care, <span className="text-gradient">even from afar.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-lg">
              CareCircle checks in with your loved one every day, remembers their medications and
              appointments, and quietly lets you know when something needs your attention.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="px-6 sm:px-8 h-12 text-base">
                <Link to="/auth">Start caring today</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-6 sm:px-8 h-12 text-base">
                <Link to="/auth">I'm a family member</Link>
              </Button>
            </div>
          </div>
          <div className="glass-strong rounded-3xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/40">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="" aria-hidden="true" className="h-9 w-9" />
              <div>
                <p className="font-medium">CareCircle</p>
                <p className="text-xs text-muted-foreground">Daily check-in · 9:02 AM</p>
              </div>
            </div>
            <div className="space-y-3 text-sm" aria-label="Example check-in conversation">
              <div className="bg-muted/80 p-3 rounded-2xl rounded-tl-sm">
                Good morning Mary! How are you feeling today?
              </div>
              <div className="gradient-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm ml-8 shadow-md shadow-emerald-900/20">
                A little dizzy this morning, but I took my pills.
              </div>
              <div className="bg-muted/80 p-3 rounded-2xl rounded-tl-sm">
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
          <div className="mx-auto rounded-2xl glass-strong shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
            <div className="bg-primary/10 px-4 py-3 border-b flex items-center gap-3">
              <img src="/logo.png" alt="CareCircle" className="h-9 w-9" />
              <div>
                <p className="font-medium">CareCircle</p>
                <p className="text-xs text-muted-foreground">Daily check-in · 9:02 AM</p>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-[30rem] overflow-y-auto scrollbar-hide">
              <div className="bg-muted/80 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                Good morning Mary! How are you feeling today?
              </div>
              <div className="bg-accent text-accent-foreground p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]">
                A little dizzy this morning, but I took my pills.
              </div>
              <div className="bg-muted/80 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                I'm glad you took them. Would you like me to let your daughter know about the
                dizziness?
              </div>
              <div className="bg-accent text-accent-foreground p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]">
                Yes please, she worries.
              </div>
              <div className="bg-muted/80 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                Done! I've sent her a gentle update. Your blood pressure reading from yesterday
                looked good too — 118/76.
              </div>
              <div className="bg-accent text-accent-foreground p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]">
                That's a relief. Thank you for checking on me.
              </div>
              <div className="bg-muted/80 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                Always. Remember your 10 AM medications — Lisinopril and Metformin. I'll check back
                this afternoon!
              </div>
            </div>
          </div>
        </ContainerScroll>

        <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mb-12 max-w-2xl md:mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Why CareCircle
            </p>
            <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
              Everything your family needs, in one place
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Four quiet tools that work together — so you can stop worrying and start caring.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
            <GradientCard
              id="daily-checkin"
              className="scroll-mt-24"
              gradient="green"
              badgeText="Takes 30 seconds"
              badgeColor="#2e8056"
              icon={PhoneCall}
              title="Daily AI check-in"
              description="A friendly call or chat every morning asks how they're feeling, tracks medications, and notices what's changed."
              ctaText="Start a check-in"
              ctaHref="/auth"
            />
            <GradientCard
              id="medication-tracking"
              className="scroll-mt-24"
              gradient="gray"
              badgeText="Free forever"
              badgeColor="#4B5563"
              icon={Pill}
              title="Medication tracking"
              description="Gentle reminders for every dose, with adherence at a glance — so a missed pill never goes unnoticed."
              ctaText="See how reminders work"
              ctaHref="/auth"
            />
            <GradientCard
              id="family-dashboard"
              className="scroll-mt-24"
              gradient="purple"
              badgeText="Built for families"
              badgeColor="#8B5CF6"
              icon={LayoutDashboard}
              title="Family dashboard"
              description="Mood trends, check-in history, and daily highlights in one shared view — even when you're miles apart."
              ctaText="View the family view"
              ctaHref="/auth"
            />
            <GradientCard
              id="smart-alerts"
              className="scroll-mt-24"
              gradient="orange"
              badgeText="Gentle, never alarming"
              badgeColor="#F59E0B"
              icon={BellRing}
              title="Smart alerts"
              description="If something seems off — a skipped check-in or unusual mood — the right person knows early."
              ctaText="Learn about alerts"
              ctaHref="/auth"
            />
          </div>
        </section>

        <PricingSection />

        <FaqSection
          title="Frequently asked questions"
          description="Everything you need to know about CareCircle."
          items={LANDING_FAQS}
          contactInfo={{
            title: "Still have questions?",
            description: "We're happy to help you and your family.",
            buttonText: "Get in touch",
          }}
        />
      </main>

      <footer className="relative border-t bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <div className="mb-4 flex items-center gap-2">
                <img src="/logo.png" alt="CareCircle" className="h-8 w-8" />
                <span className="font-heading text-xl font-semibold tracking-tight">
                  CareCircle
                </span>
              </div>
              <p className="max-w-xs leading-relaxed text-muted-foreground">
                Gentle daily check-ins for aging loved ones. Peace of mind for the whole family.
              </p>
              <div
                aria-hidden="true"
                className="absolute -top-4 -right-4 size-24 rounded-full bg-primary/10 blur-2xl"
              />
            </div>
            <nav aria-label="Product">
              <h3 className="mb-4 font-heading font-semibold">Product</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  ["Daily Check-in", "/#daily-checkin"],
                  ["Medication Tracking", "/#medication-tracking"],
                  ["Family Dashboard", "/#family-dashboard"],
                  ["Smart Alerts", "/#smart-alerts"],
                  ["Pricing", "/#pricing"],
                  ["FAQ", "/#faq"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="transition-colors hover:text-primary">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Company">
              <h3 className="mb-4 font-heading font-semibold">Company</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="transition-colors hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition-colors hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label="Resources">
              <h3 className="mb-4 font-heading font-semibold">Resources</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="transition-colors hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="transition-colors hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refunds" className="transition-colors hover:text-primary">
                    Refund &amp; Cancellation Policy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row md:text-left">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CareCircle. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Not a medical device. Always consult a healthcare professional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
