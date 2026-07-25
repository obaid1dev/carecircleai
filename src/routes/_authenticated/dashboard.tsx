import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Pill, Calendar, Phone } from "lucide-react";
import {
  getProfile,
  listMedications,
  listAppointments,
  getTodayCheckin,
} from "@/lib/data.functions";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your day · CareCircle" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const meds = useQuery({ queryKey: ["meds"], queryFn: () => listMedications() });
  const appts = useQuery({ queryKey: ["appts"], queryFn: () => listAppointments() });
  const today = useQuery({ queryKey: ["today-checkin"], queryFn: () => getTodayCheckin() });

  const now = new Date();
  const nextAppt = (appts.data ?? []).find((a) => new Date(a.appt_at) >= now);
  const nextMed = (meds.data ?? []).find((m) => !m.taken_today);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">{format(now, "EEEE, MMMM d")}</p>
        <h1 className="text-3xl md:text-4xl font-bold">
          Good {greeting()}, {profile.data?.name || "friend"} 💛
        </h1>
      </div>

      <Card className="bg-primary text-primary-foreground border-0">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">
              {today.data ? "You've checked in today ✓" : "Time for your daily check-in"}
            </h2>
            <p className="opacity-90 mt-1">
              {today.data
                ? "Thank you for sharing today. Feel free to chat again anytime."
                : "A quick chat with your AI companion — just a few minutes."}
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="text-base">
            <Link to="/chat">
              <MessageCircle className="mr-2 w-5 h-5" />
              {today.data ? "Chat again" : "Start check-in"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="w-5 h-5 text-primary" /> Medications today
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(meds.data ?? []).length === 0 && (
              <p className="text-muted-foreground">No medications yet.</p>
            )}
            {(meds.data ?? []).slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary"
              >
                <div>
                  <p className="font-medium">{m.medicine_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.dosage ? `${m.dosage} · ` : ""}
                    {m.reminder_time?.slice(0, 5)}
                  </p>
                </div>
                <span
                  className={
                    m.taken_today
                      ? "text-success text-sm font-medium"
                      : "text-muted-foreground text-sm"
                  }
                >
                  {m.taken_today ? "✓ Taken" : "Pending"}
                </span>
              </div>
            ))}
            {nextMed && !today.data && (
              <p className="text-sm text-muted-foreground pt-2">
                Next: {nextMed.medicine_name} at {nextMed.reminder_time?.slice(0, 5)}
              </p>
            )}
            <Button asChild variant="outline" className="w-full mt-2">
              <Link to="/medications">Manage medications</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" /> Upcoming appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextAppt ? (
              <div className="p-3 rounded-lg bg-secondary">
                <p className="font-medium">{nextAppt.doctor}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(nextAppt.appt_at), "EEE, MMM d · h:mm a")}
                </p>
                {nextAppt.notes && <p className="text-sm mt-1">{nextAppt.notes}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming appointments.</p>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/appointments">See all</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {profile.data?.emergency_contact_phone && (
        <Card className="bg-warm border-warm">
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="w-5 h-5 text-warm-foreground" />
            <div className="flex-1">
              <p className="text-sm text-warm-foreground/70">Emergency contact</p>
              <p className="font-medium text-warm-foreground">
                {profile.data.emergency_contact_name} · {profile.data.emergency_contact_phone}
              </p>
            </div>
            <Button asChild variant="secondary">
              <a href={`tel:${profile.data.emergency_contact_phone}`}>Call</a>
            </Button>
          </CardContent>
        </Card>
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
