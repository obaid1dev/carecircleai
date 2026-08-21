import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { MessageCircle, Pill, Calendar, ShieldAlert, Users, Heart, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { PricingSection } from "@/components/pricing/PricingSection";
import { useTheme } from "@/lib/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

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
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <img src="/logo.png" alt="CareCircle" className="w-6 h-6 shrink-0" />
          <span className="hidden sm:inline">CareCircle</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="transition-colors shrink-0"
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
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-warm/10 blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm text-warm-foreground text-sm font-medium shadow-sm">
            <img src="/logo.png" alt="CareCircle" className="w-4 h-4" />
            AI companion for seniors
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Helping families care,{" "}
            <span className="bg-gradient-to-r from-primary via-emerald-500 to-emerald-600 bg-clip-text text-transparent">
              even from afar.
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            CareCircle checks in with your loved one every day, remembers their medications and
            appointments, and quietly lets you know when something needs your attention.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="px-6 sm:px-8">
              <Link to="/auth">Start caring today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 sm:px-8">
              <Link to="/auth">I'm a family member</Link>
            </Button>
          </div>
        </div>
        <div className="glass-strong rounded-3xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-700/25">
              <img src="/logo.png" alt="CareCircle" className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">CareCircle</p>
              <p className="text-xs text-muted-foreground">Daily check-in · 9:02 AM</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="bg-secondary/70 p-3 rounded-2xl rounded-tl-sm">
              Good morning Mary 🌞 How are you feeling today?
            </div>
            <div className="bg-gradient-to-br from-primary to-emerald-600 text-white p-3 rounded-2xl rounded-tr-sm ml-8 shadow-md shadow-emerald-900/20">
              A little dizzy this morning, but I took my pills.
            </div>
            <div className="bg-secondary/70 p-3 rounded-2xl rounded-tl-sm">
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
              Done! I've sent her a gentle update. Your blood pressure reading from yesterday looked
              good too — 118/76.
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]">
              That's a relief. Thank you for checking on me.
            </div>
            <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
              Always. Remember your 10 AM medications — Lisinopril and Metformin. I'll check back
              this afternoon!
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
                id: "daily-checkin",
                icon: MessageCircle,
                title: "Daily AI check-in",
                desc: "A warm conversation each morning to see how they're doing.",
              },
              {
                id: "medication-tracking",
                icon: Pill,
                title: "Medication reminders",
                desc: "Never miss a dose. Adherence is tracked for the family.",
              },
              {
                id: "appointment-tracking",
                icon: Calendar,
                title: "Appointment tracking",
                desc: "Doctor visits stay on the calendar for everyone.",
              },
              {
                id: "smart-alerts",
                icon: ShieldAlert,
                title: "Smart alerts",
                desc: "Family is notified early if something seems off.",
              },
              {
                id: "family-dashboard",
                icon: Users,
                title: "Family dashboard",
                desc: "Mood trends, summaries, and a shared view of wellbeing.",
              },
              {
                id: "never-replaces-care",
                icon: Heart,
                title: "Never replaces care",
                desc: "An early warning system, not a diagnosis. Always kind.",
              },
            ].map((f) => (
              <div id={f.id} key={f.title} className="glass card-hover p-6 rounded-2xl">
                <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl gradient-primary shadow-md shadow-emerald-700/25 mb-3">
                  <f.icon className="w-5 h-5 text-white" />
                </span>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

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
                Gentle daily check-ins for aging loved ones. Peace of mind for the whole family.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/#daily-checkin" className="hover:text-foreground transition-colors">
                    Daily Check-in
                  </a>
                </li>
                <li>
                  <a href="/#medication-tracking" className="hover:text-foreground transition-colors">
                    Medication Tracking
                  </a>
                </li>
                <li>
                  <a href="/#family-dashboard" className="hover:text-foreground transition-colors">
                    Family Dashboard
                  </a>
                </li>
                <li>
                  <a href="/#smart-alerts" className="hover:text-foreground transition-colors">
                    Smart Alerts
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/about" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refunds" className="hover:text-foreground transition-colors">
                    Refund &amp; Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                &copy; {new Date().getFullYear()} CareCircle. Not a medical device. Always consult a
                healthcare professional.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
