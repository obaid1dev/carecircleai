import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Pill, Calendar, MessageCircle, X } from "lucide-react";
import {
  getProfile,
  listMedications,
  listAppointments,
  listCheckins,
  listAlerts,
  dismissAlert,
} from "@/lib/data.functions";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/family")({
  head: () => ({ meta: [{ title: "Family dashboard · CareCircle" }] }),
  component: Family,
});

function Family() {
  const qc = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const meds = useQuery({ queryKey: ["meds"], queryFn: () => listMedications() });
  const appts = useQuery({ queryKey: ["appts"], queryFn: () => listAppointments() });
  const checkins = useQuery({ queryKey: ["checkins"], queryFn: () => listCheckins() });
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: () => listAlerts() });

  const dismiss = useMutation({
    mutationFn: (id: string) => dismissAlert({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const medList = meds.data ?? [];
  const takenToday = medList.filter((m) => m.taken_today).length;
  const adherence = medList.length ? Math.round((takenToday / medList.length) * 100) : 0;

  const chartData = [...(checkins.data ?? [])].reverse().map((c) => ({
    date: format(new Date(c.checkin_date), "MMM d"),
    mood: c.mood_score ?? null,
  }));

  const today = (checkins.data ?? [])[0];
  const openAlerts = (alerts.data ?? []).filter((a) => !a.is_read);
  const upcomingAppt = (appts.data ?? []).find((a) => !isPast(new Date(a.appt_at)));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">Family dashboard</p>
        <h1 className="text-3xl font-bold">
          How {profile.data?.name || "your loved one"} is doing
        </h1>
      </div>

      {openAlerts.length > 0 && (
        <div className="space-y-2">
          {openAlerts.map((a) => (
            <Card
              key={a.id}
              className={`border-l-4 ${
                a.severity === "high"
                  ? "border-l-destructive bg-destructive/5"
                  : a.severity === "medium"
                    ? "border-l-accent bg-accent/5"
                    : "border-l-warning bg-warning/5"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 mt-0.5 ${
                    a.severity === "high" ? "text-destructive" : "text-accent"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {a.severity} · {a.alert_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{a.message}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => dismiss.mutate(a.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Stat
          icon={<MessageCircle className="w-5 h-5" />}
          label="Today's check-in"
          value={today ? `Mood ${today.mood_score}/10` : "Not yet"}
          hint={today?.risk_level ? `${today.risk_level} risk` : "No check-in today"}
        />
        <Stat
          icon={<Pill className="w-5 h-5" />}
          label="Medication today"
          value={`${adherence}%`}
          hint={`${takenToday} of ${medList.length} taken`}
        />
        <Stat
          icon={<Calendar className="w-5 h-5" />}
          label="Next appointment"
          value={upcomingAppt ? upcomingAppt.doctor : "None"}
          hint={
            upcomingAppt
              ? format(new Date(upcomingAppt.appt_at), "MMM d · h:mm a")
              : "Nothing scheduled"
          }
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" /> Mood trend (last {chartData.length}{" "}
              days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="var(--color-primary)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center pt-12">
                No check-ins yet. Start one to see mood trends here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent AI summaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-64 overflow-y-auto">
            {(checkins.data ?? []).length === 0 && (
              <p className="text-muted-foreground">No check-ins yet.</p>
            )}
            {(checkins.data ?? []).slice(0, 6).map((c) => (
              <div key={c.id} className="border-l-2 border-primary/30 pl-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(c.checkin_date), "MMM d")}</span>
                  {c.risk_level && (
                    <Badge variant="outline" className="capitalize text-xs">
                      {c.risk_level}
                    </Badge>
                  )}
                </div>
                <p className="text-sm mt-1">{c.ai_summary || "No summary."}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Medication adherence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {medList.length === 0 && <p className="text-muted-foreground">No medications tracked.</p>}
          {medList.map((m) => (
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
              <Badge variant={m.taken_today ? "default" : "outline"}>
                {m.taken_today ? "Taken today" : "Not yet"}
              </Badge>
            </div>
          ))}
          <Button asChild variant="outline" className="w-full mt-2">
            <Link to="/medications">Manage</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {icon} {label}
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
      </CardContent>
    </Card>
  );
}
