import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Pill, Calendar, Phone, Crown, Heart, Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  getProfile,
  listMedications,
  listAppointments,
  getTodayCheckin,
} from "@/lib/data.functions";
import { format } from "date-fns";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your day · CareCircle" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const meds = useQuery({ queryKey: ["meds"], queryFn: () => listMedications() });
  const appts = useQuery({ queryKey: ["appts"], queryFn: () => listAppointments() });
  const today = useQuery({ queryKey: ["today-checkin"], queryFn: () => getTodayCheckin() });
  const { isPro, openPaywall } = useSubscriptionContext();

  const now = new Date();
  const nextAppt = (appts.data ?? []).find((a) => new Date(a.appt_at) >= now);
  const nextMed = (meds.data ?? []).find((m) => !m.taken_today);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          {format(now, "EEEE, MMMM d")}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">
          Good {greeting()}, <span className="text-gradient">{profile.data?.name || "friend"}</span>{" "}
          <Heart aria-hidden="true" className="inline w-6 h-6 text-primary fill-primary/40 -mt-1" />
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="relative overflow-hidden rounded-3xl gradient-primary text-primary-foreground border-0 shadow-xl shadow-emerald-900/25"
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <CardContent className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold flex items-center gap-2.5">
              {today.data && <Check aria-hidden="true" className="w-6 h-6" />}
              {today.data ? "You've checked in today" : "Time for your daily check-in"}
            </h2>
            <p className="opacity-90 mt-1.5 max-w-prose">
              {today.data
                ? isPro
                  ? "Thank you for sharing today. Feel free to chat again anytime."
                  : "You've used today's Daily Check-in. Upgrade for unlimited check-ins."
                : "A quick chat with your AI companion — just a few minutes."}
            </p>
          </div>
          {!isPro && today.data && (
            <Button
              size="sm"
              onClick={() => openPaywall()}
              className="bg-black/15 text-primary-foreground hover:bg-black/25 border border-white/30 shadow-none backdrop-blur"
            >
              <Crown className="w-4 h-4" />
              Go Pro
            </Button>
          )}
          <Button
            asChild
            size="lg"
            className="bg-none! text-base bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
          >
            <Link to="/chat">
              <MessageCircle className="mr-2 w-5 h-5" />
              {today.data ? "Chat again" : "Start check-in"}
            </Link>
          </Button>
        </CardContent>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Card className="glass rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-md shadow-emerald-900/20">
                  <Pill className="w-4 h-4" />
                </span>
                Medications today
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(meds.data ?? []).length === 0 && (
                <p className="text-muted-foreground">No medications yet.</p>
              )}
              {(meds.data ?? []).slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/70"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.medicine_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.dosage ? `${m.dosage} · ` : ""}
                      {m.reminder_time?.slice(0, 5)}
                    </p>
                  </div>
                  {m.taken_today ? (
                    <Badge variant="success" className="shrink-0">
                      <Check aria-hidden="true" />
                      Taken
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0">
                      Pending
                    </Badge>
                  )}
                </div>
              ))}
              {nextMed && !today.data && (
                <p className="text-sm text-muted-foreground pt-2">
                  Next: {nextMed.medicine_name} at {nextMed.reminder_time?.slice(0, 5)}
                </p>
              )}
              <Button asChild variant="outline" className="w-full mt-2 rounded-xl">
                <Link to="/medications">Manage medications</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <Card className="glass rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-md shadow-emerald-900/20">
                  <Calendar className="w-4 h-4" />
                </span>
                Upcoming appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nextAppt ? (
                <div className="p-3 rounded-xl bg-muted/70">
                  <p className="font-medium">{nextAppt.doctor}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(nextAppt.appt_at), "EEE, MMM d · h:mm a")}
                  </p>
                  {nextAppt.notes && <p className="text-sm mt-1">{nextAppt.notes}</p>}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming appointments.</p>
              )}
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link to="/appointments">See all</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {profile.data?.emergency_contact_phone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <Card className="rounded-2xl bg-warm/60 dark:bg-warm/40 border-warm/60 shadow-md shadow-warm-foreground/10">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-warm-foreground/15 text-warm-foreground">
                <Phone className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-warm-foreground/80">
                  Emergency contact
                </p>
                <p className="font-medium text-warm-foreground truncate">
                  {profile.data.emergency_contact_name} · {profile.data.emergency_contact_phone}
                </p>
              </div>
              <Button asChild variant="secondary" className="rounded-full">
                <a href={`tel:${profile.data.emergency_contact_phone}`}>Call</a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
