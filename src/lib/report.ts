import { format } from "date-fns";

interface ReportItem {
  id: string;
  [key: string]: unknown;
}

interface HealthReportData {
  name: string;
  checkins: (ReportItem & {
    checkin_date: string;
    mood_score: number | null;
    risk_level: string | null;
    ai_summary: string | null;
  })[];
  medications: (ReportItem & {
    medicine_name: string;
    dosage: string | null;
    reminder_time: string | null;
    taken_today: boolean;
  })[];
  appointments: (ReportItem & { doctor: string; appt_at: string; notes: string | null })[];
}

/** Generates and downloads a plain-text health report (Pro feature). */
export function downloadHealthReport(data: HealthReportData): void {
  const generated = new Date().toISOString();
  const lines: string[] = [
    "CareCircle Health Report",
    "========================",
    "",
    `For: ${data.name || "—"}`,
    `Generated: ${format(new Date(generated), "MMM d, yyyy h:mm a")}`,
    "",
    "Daily Check-ins",
    "---------------",
  ];

  if (data.checkins.length === 0) {
    lines.push("No check-ins recorded.");
  }
  for (const c of data.checkins) {
    lines.push(
      `${format(new Date(c.checkin_date), "MMM d, yyyy")} — Mood ${c.mood_score ?? "n/a"}/10, ` +
        `risk: ${c.risk_level ?? "n/a"}`,
    );
    if (c.ai_summary) lines.push(`  ${c.ai_summary}`);
  }

  lines.push("", "Medications", "-----------");
  if (data.medications.length === 0) lines.push("No medications recorded.");
  for (const m of data.medications) {
    lines.push(
      `${m.medicine_name}${m.dosage ? ` (${m.dosage})` : ""} — ${m.reminder_time?.slice(0, 5) ?? "—"} ` +
        `— ${m.taken_today ? "taken today" : "not taken today"}`,
    );
  }

  lines.push("", "Appointments", "------------");
  if (data.appointments.length === 0) lines.push("No appointments recorded.");
  for (const a of data.appointments) {
    lines.push(
      `${a.doctor} — ${format(new Date(a.appt_at), "MMM d, yyyy h:mm a")}${a.notes ? ` — ${a.notes}` : ""}`,
    );
  }

  lines.push("", "Not a medical record. Always consult a healthcare professional.");

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `carecircle-health-report-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
