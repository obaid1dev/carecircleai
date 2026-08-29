import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Calendar as CalIcon, Crown } from "lucide-react";
import { listAppointments, addAppointment, deleteAppointment } from "@/lib/data.functions";
import { useState } from "react";
import { format, isPast } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";
import { PLANS } from "@/lib/subscription/plans";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({ meta: [{ title: "Appointments · CareCircle" }] }),
  component: ApptPage,
});

function ApptPage() {
  const qc = useQueryClient();
  const appts = useQuery({ queryKey: ["appts"], queryFn: () => listAppointments() });
  const [open, setOpen] = useState(false);
  const { guard, isPro, openPaywall, isLimitError } = useSubscriptionContext();

  const add = useMutation({
    mutationFn: (v: { doctor: string; appt_at: string; notes?: string }) =>
      addAppointment({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appts"] });
      setOpen(false);
      toast.success("Appointment added");
    },
    onError: (err) => {
      if (isLimitError(err)) openPaywall();
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteAppointment({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appts"] }),
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!guard("appointments", list.length)) return;
    const fd = new FormData(e.currentTarget);
    const date = String(fd.get("date"));
    const time = String(fd.get("time"));
    add.mutate({
      doctor: String(fd.get("doctor")),
      appt_at: new Date(`${date}T${time}`).toISOString(),
      notes: String(fd.get("notes") || ""),
    });
  };

  const list = appts.data ?? [];
  const upcoming = list.filter((a) => !isPast(new Date(a.appt_at)));
  const past = list.filter((a) => isPast(new Date(a.appt_at)));
  const apptLimit = PLANS.free.limits.appointments;
  const atLimit = !isPro && list.length >= apptLimit;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-lg shadow-emerald-900/20">
            <CalIcon className="w-5 h-5" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" disabled={atLimit}>
              <Plus className="mr-2 w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="doctor">Doctor / Clinic</Label>
                <Input id="doctor" name="doctor" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" name="time" type="time" required defaultValue="10:00" />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
              <Button type="submit" className="w-full" disabled={add.isPending}>
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {!isPro && (
        <div className="flex items-center justify-between gap-2 flex-wrap rounded-xl glass px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">
            {atLimit
              ? "Your free limit has been reached."
              : `You've added ${list.length} of ${apptLimit} free appointment${apptLimit === 1 ? "" : "s"}.`}
          </span>
          {atLimit && (
            <Button size="sm" onClick={() => openPaywall()}>
              <Crown className="w-3.5 h-3.5" /> Upgrade
            </Button>
          )}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <Card className="glass rounded-2xl">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.length === 0 && (
              <p className="text-muted-foreground text-center py-6">No upcoming appointments.</p>
            )}
            {upcoming.map((a) => (
              <Item key={a.id} a={a} onDelete={() => del.mutate(a.id)} />
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {past.length > 0 && (
        <Card className="glass rounded-2xl">
          <CardHeader>
            <CardTitle className="text-muted-foreground">Past</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {past.map((a) => (
              <Item key={a.id} a={a} onDelete={() => del.mutate(a.id)} muted />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Item({
  a,
  onDelete,
  muted,
}: {
  a: { id: string; doctor: string; appt_at: string; notes: string | null };
  onDelete: () => void;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl bg-muted/70 transition-colors duration-200 hover:bg-muted ${
        muted ? "opacity-75" : ""
      }`}
    >
      <div className="w-10 h-10 shrink-0 rounded-lg gradient-primary text-primary-foreground flex items-center justify-center shadow-md shadow-emerald-900/20">
        <CalIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{a.doctor}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(a.appt_at), "EEE, MMM d · h:mm a")}
        </p>
        {a.notes && <p className="text-sm mt-1">{a.notes}</p>}
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        aria-label={`Delete appointment with ${a.doctor}`}
        className="shrink-0 -mr-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
