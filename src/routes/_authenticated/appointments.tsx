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
import { Plus, Trash2, Calendar as CalIcon } from "lucide-react";
import { listAppointments, addAppointment, deleteAppointment } from "@/lib/data.functions";
import { useState } from "react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({ meta: [{ title: "Appointments · CareCircle" }] }),
  component: ApptPage,
});

function ApptPage() {
  const qc = useQueryClient();
  const appts = useQuery({ queryKey: ["appts"], queryFn: () => listAppointments() });
  const [open, setOpen] = useState(false);

  const add = useMutation({
    mutationFn: (v: { doctor: string; appt_at: string; notes?: string }) =>
      addAppointment({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appts"] });
      setOpen(false);
      toast.success("Appointment added");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteAppointment({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appts"] }),
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
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
      </div>

      <Card>
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

      {past.length > 0 && (
        <Card>
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
      className={`flex items-center gap-3 p-3 rounded-xl bg-secondary ${muted ? "opacity-70" : ""}`}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <CalIcon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{a.doctor}</p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(a.appt_at), "EEE, MMM d · h:mm a")}
        </p>
        {a.notes && <p className="text-sm mt-1">{a.notes}</p>}
      </div>
      <Button size="icon" variant="ghost" onClick={onDelete}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
