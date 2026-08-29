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
import { Plus, Trash2, Crown, Pill } from "lucide-react";
import {
  listMedications,
  addMedication,
  deleteMedication,
  markMedicationTaken,
} from "@/lib/data.functions";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";
import { PLANS } from "@/lib/subscription/plans";

export const Route = createFileRoute("/_authenticated/medications")({
  head: () => ({ meta: [{ title: "Medications · CareCircle" }] }),
  component: MedsPage,
});

function MedsPage() {
  const qc = useQueryClient();
  const meds = useQuery({ queryKey: ["meds"], queryFn: () => listMedications() });
  const [open, setOpen] = useState(false);
  const { guard, isPro, openPaywall, isLimitError } = useSubscriptionContext();

  const add = useMutation({
    mutationFn: (v: { medicine_name: string; dosage?: string; reminder_time: string }) =>
      addMedication({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meds"] });
      setOpen(false);
      toast.success("Medication added");
    },
    onError: (err) => {
      if (isLimitError(err)) openPaywall();
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
    if (!guard("medications", list.length)) return;
    const fd = new FormData(e.currentTarget);
    add.mutate({
      medicine_name: String(fd.get("name")),
      dosage: String(fd.get("dosage") || ""),
      reminder_time: String(fd.get("time")),
    });
  };

  const list = meds.data ?? [];
  const taken = list.filter((m) => m.taken_today).length;
  const medLimit = PLANS.free.limits.medications;
  const atLimit = !isPro && list.length >= medLimit;

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
            <Pill className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
            <p className="text-sm text-muted-foreground">
              {taken} of {list.length} taken today
            </p>
          </div>
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
      </motion.div>

      {!isPro && (
        <div className="flex items-center justify-between gap-2 flex-wrap rounded-xl glass px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">
            {atLimit
              ? "Your free limit has been reached."
              : `You've added ${list.length} of ${medLimit} free medications.`}
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
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {list.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No medications yet. Add one to start tracking.
              </p>
            )}
            {list.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/70 transition-colors duration-200 hover:bg-muted"
              >
                <Checkbox
                  checked={m.taken_today}
                  onCheckedChange={(v) => toggle.mutate({ medication_id: m.id, taken: Boolean(v) })}
                  className="w-6 h-6 shrink-0 cursor-pointer"
                  aria-label={`Mark ${m.medicine_name} as taken`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-lg truncate ${
                      m.taken_today ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {m.medicine_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {m.dosage ? `${m.dosage} · ` : ""}
                    {m.reminder_time?.slice(0, 5)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => del.mutate(m.id)}
                  aria-label={`Delete ${m.medicine_name}`}
                  className="shrink-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
