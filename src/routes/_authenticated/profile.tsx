import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProfile, updateProfile } from "@/lib/data.functions";
import { motion } from "framer-motion";
import { UserRound, Siren, HeartPulse, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile · CareCircle" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const router = useRouter();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });

  const save = useMutation({
    mutationFn: (v: {
      name: string;
      age?: number | null;
      medical_conditions?: string | null;
      emergency_contact_name?: string | null;
      emergency_contact_phone?: string | null;
      preferred_reminder_time?: string | null;
    }) => updateProfile({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    },
  });

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ageStr = String(fd.get("age") || "");
    save.mutate({
      name: String(fd.get("name")),
      age: ageStr ? Number(ageStr) : null,
      medical_conditions: String(fd.get("medical_conditions") || ""),
      emergency_contact_name: String(fd.get("ec_name") || ""),
      emergency_contact_phone: String(fd.get("ec_phone") || ""),
      preferred_reminder_time: String(fd.get("reminder_time") || "09:00"),
    });
  };

  if (!profile.data)
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">Loading...</div>
    );
  const p = profile.data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Your <span className="text-gradient">profile</span>
        </h1>
      </motion.div>
      <form onSubmit={submit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <Card className="glass rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg gradient-primary shadow-md shadow-emerald-700/25">
                  <UserRound className="w-4 h-4 text-white" />
                </span>{" "}
                About you
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={p.name} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" defaultValue={p.age ?? ""} />
                </div>
                <div>
                  <Label htmlFor="reminder_time">Preferred check-in time</Label>
                  <Input
                    id="reminder_time"
                    name="reminder_time"
                    type="time"
                    defaultValue={p.preferred_reminder_time?.slice(0, 5) ?? "09:00"}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="medical_conditions">Medical conditions</Label>
                <Textarea
                  id="medical_conditions"
                  name="medical_conditions"
                  rows={3}
                  defaultValue={p.medical_conditions ?? ""}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Card className="glass rounded-2xl mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-warm text-warm-foreground shadow-md shadow-warm-foreground/10">
                  <Siren className="w-4 h-4" />
                </span>{" "}
                Emergency contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ec_name">Name</Label>
                <Input id="ec_name" name="ec_name" defaultValue={p.emergency_contact_name ?? ""} />
              </div>
              <div>
                <Label htmlFor="ec_phone">Phone</Label>
                <Input
                  id="ec_phone"
                  name="ec_phone"
                  type="tel"
                  defaultValue={p.emergency_contact_phone ?? ""}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button
          type="submit"
          size="lg"
          className="mt-4 w-full rounded-xl"
          disabled={save.isPending}
        >
          <HeartPulse className="w-4 h-4" />
          Save changes
        </Button>
      </form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
      >
        <Card className="rounded-2xl border border-destructive/20 bg-destructive/5">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">
                You'll need to sign back in to access your CareCircle.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="shrink-0"
              onClick={async () => {
                await supabase.auth.signOut();
                router.navigate({ to: "/auth" });
              }}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
