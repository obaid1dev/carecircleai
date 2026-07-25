import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import {
  listMedications,
  addMedication,
  deleteMedication,
  markMedicationTaken,
} from "@/lib/data.functions";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/medications")({
  head: () => ({ meta: [{ title: "Medications · CareCircle" }] }),
  component: MedsPage,
});

function MedsPage() {
  const qc = useQueryClient();
  const meds = useQuery({ queryKey: ["meds"], queryFn: () => listMedications() });
  const [open, setOpen] = useState(false);

  const add = useMutation({
    mutationFn: (v: { medicine_name: string; dosage?: string; reminder_time: string }) =>
      addMedication({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meds"] });
      setOpen(false);
      toast.success("Medication added");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteMedication({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meds"] }),
  });

  const toggle = useMutation({
    mutationFn: (v: { medication_id: string; taken: boolean }) => markMedicationTaken({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meds"] }),
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    add.mutate({
      medicine_name: String(fd.get("name")),
      dosage: String(fd.get("dosage") || ""),
      reminder_time: String(fd.get("time")),
    });
  };

  const list = meds.data ?? [];
  const taken = list.filter((m) => m.taken_today).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medications</h1>
          <p className="text-muted-foreground">
            {taken} of {list.length} taken today
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="mr-2 w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New medication</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="name">Medicine name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage (optional)</Label>
                <Input id="dosage" name="dosage" placeholder="e.g. 10mg, 1 tablet" />
              </div>
              <div>
                <Label htmlFor="time">Reminder time</Label>
                <Input id="time" name="time" type="time" defaultValue="09:00" required />
              </div>
              <Button type="submit" className="w-full" disabled={add.isPending}>
                Add medication
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {list.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No medications yet. Add one to start tracking.
            </p>
          )}
          {list.map((m) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
              <Checkbox
                checked={m.taken_today}
                onCheckedChange={(v) => toggle.mutate({ medication_id: m.id, taken: Boolean(v) })}
                className="w-6 h-6"
              />
              <div className="flex-1">
                <p
                  className={`font-medium text-lg ${m.taken_today ? "line-through opacity-60" : ""}`}
                >
                  {m.medicine_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {m.dosage ? `${m.dosage} · ` : ""}
                  {m.reminder_time?.slice(0, 5)}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => del.mutate(m.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
