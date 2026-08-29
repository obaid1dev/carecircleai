import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  Pill,
  Calendar,
  MessageCircle,
  X,
  FileDown,
} from "lucide-react";
import {
  getProfile,
  listMedications,
  listAppointments,
  listCheckins,
  listAlerts,
  dismissAlert,
} from "@/lib/data.functions";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { motion } from "framer-motion";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";
import { ProGate } from "@/components/subscription/ProGate";
import { downloadHealthReport } from "@/lib/report";
import { toast } from "sonner";
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
  const { guard, isPro } = useSubscriptionContext();

  const exportReport = () => {
    if (!guard("export_reports")) return;
    downloadHealthReport({
      name: profile.data?.name || "Your loved one",
      checkins: (checkins.data ?? []).map((c) => ({
        id: c.id,
        checkin_date: c.checkin_date,
        mood_score: c.mood_score,
        risk_level: c.risk_level,
        ai_summary: c.ai_summary,
      })),
      medications: (meds.data ?? []).map((m) => ({
        id: m.id,
        medicine_name: m.medicine_name,
        dosage: m.dosage,
        reminder_time: m.reminder_time,
        taken_today: m.taken_today,
      })),
      appointments: (appts.data ?? []).map((a) => ({
        id: a.id,
        doctor: a.doctor,
        appt_at: a.appt_at,
        notes: a.notes,
      })),
    });
    toast.success("Health report downloaded");
  };

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
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Family dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">
            How <span className="text-gradient">{profile.data?.name || "your loved one"}</span> is
            doing
          </h1>
        </div>
        <Button
          variant={isPro ? "outline" : "default"}
          size="sm"
          onClick={exportReport}
          className="self-start sm:self-auto gap-2"
        >
          <FileDown className="w-4 h-4" />
          Export health report
        </Button>
      </motion.div>

      {openAlerts.length > 0 && (
        <div className="space-y-2">
          {openAlerts.map((a) => (
            <Card
              key={a.id}
              className={`border-l-4 ${
                a.severity === "high"
                  ? "border-l-destructive bg-destructive/5"
                  : a.severity === "medium"
                    ? "border-l-warning bg-warning/5"
                    : "border-l-info bg-info/5"
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle
                  aria-hidden="true"
                  className={`w-5 h-5 mt-0.5 shrink-0 ${
                    a.severity === "high" ? "text-destructive" : "text-warning"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        a.severity === "high"
                          ? "destructive"
                          : a.severity === "medium"
                            ? "warning"
                            : "info"
                      }
                      className="capitalize"
                    >
                      {a.severity} · {a.alert_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1">{a.message}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => dismiss.mutate(a.id)}
                  aria-label="Dismiss alert"
                  className="shrink-0 -mr-1.5 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Stat
            icon={<MessageCircle className="w-5 h-5" />}
            label="Today's check-in"
            value={today ? `Mood ${today.mood_score}/10` : "Not yet"}
            hint={today?.risk_level ? `${today.risk_level} risk` : "No check-in today"}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <Stat
            icon={<Pill className="w-5 h-5" />}
            label="Medication today"
            value={`${adherence}%`}
            hint={`${takenToday} of ${medList.length} taken`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
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
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          <Card className="glass rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <span className="inline-flex w-9 h-9 shrink-0 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-md shadow-emerald-900/20">
                  <TrendingUp className="w-4 h-4" />
                </span>
                Mood trend (last {chartData.length} days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ProGate
                title="AI Health Insights"
                description="Mood trends and deeper wellbeing analysis for your loved one."
              >
                {chartData.length > 0 ? (
                  <div
                    role="img"
                    aria-label={`Line chart of mood scores over the last ${chartData.length} days`}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis
                          dataKey="date"
                          stroke="var(--color-muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          dy={8}
                        />
                        <YAxis
                          domain={[0, 10]}
                          stroke="var(--color-muted-foreground)"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={28}
                        />
                        <Tooltip
                          cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.25 }}
                          contentStyle={{
                            background: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 12,
                            boxShadow: "var(--shadow-lift)",
                            color: "var(--color-popover-foreground)",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke="var(--color-primary)"
                          strokeWidth={2.5}
                          dot={{ r: 3, strokeWidth: 0, fill: "var(--color-primary)" }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center pt-12">
                    No check-ins yet. Start one to see mood trends here.
                  </p>
                )}
              </ProGate>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
        >
          <Card className="glass rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Recent AI summaries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
              <ProGate
                title="AI Summaries"
                description="Daily AI summaries and health insights for your loved one."
              >
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
              </ProGate>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
      >
        <Card className="glass rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Medication adherence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {medList.length === 0 && (
              <p className="text-muted-foreground">No medications tracked.</p>
            )}
            {medList.map((m) => (
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
                    Taken today
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0">
                    Not yet
                  </Badge>
                )}
              </div>
            ))}
            <Button asChild variant="outline" className="w-full mt-2 rounded-xl">
              <Link to="/medications">Manage</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
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
    <Card className="glass rounded-2xl card-hover">
      <CardContent className="p-5">
        <div className="flex items-center gap-2.5 text-muted-foreground text-sm font-medium">
          <span className="inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          {label}
        </div>
        <p className="font-heading text-2xl font-bold tracking-tight mt-2.5">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{hint}</p>
      </CardContent>
    </Card>
  );
}
