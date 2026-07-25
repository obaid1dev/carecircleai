import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// ---------- Profile ----------
export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const profileSchema = z.object({
  name: z.string().max(120),
  age: z.number().int().min(0).max(130).nullable().optional(),
  medical_conditions: z.string().max(2000).nullable().optional(),
  emergency_contact_name: z.string().max(120).nullable().optional(),
  emergency_contact_phone: z.string().max(40).nullable().optional(),
  preferred_reminder_time: z.string().nullable().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => profileSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setActiveRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ role: z.enum(["senior", "caregiver"]) }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ active_role: data.role })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Medications ----------
export const listMedications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [meds, logs] = await Promise.all([
      context.supabase.from("medications").select("*").order("reminder_time"),
      context.supabase
        .from("medication_logs")
        .select("*")
        .eq("taken_date", new Date().toISOString().slice(0, 10)),
    ]);
    if (meds.error) throw new Error(meds.error.message);
    if (logs.error) throw new Error(logs.error.message);
    const takenIds = new Set(logs.data.map((l) => l.medication_id));
    return (meds.data ?? []).map((m) => ({ ...m, taken_today: takenIds.has(m.id) }));
  });

export const addMedication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({
        medicine_name: z.string().min(1).max(120),
        dosage: z.string().max(120).optional(),
        reminder_time: z.string(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("medications")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMedication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("medications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markMedicationTaken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ medication_id: z.string().uuid(), taken: z.boolean() }).parse(v),
  )
  .handler(async ({ data, context }) => {
    const date = new Date().toISOString().slice(0, 10);
    if (data.taken) {
      const { error } = await context.supabase
        .from("medication_logs")
        .upsert(
          { medication_id: data.medication_id, user_id: context.userId, taken_date: date },
          { onConflict: "medication_id,taken_date" },
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("medication_logs")
        .delete()
        .eq("medication_id", data.medication_id)
        .eq("taken_date", date);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// ---------- Appointments ----------
export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("appointments")
      .select("*")
      .order("appt_at");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({
        doctor: z.string().min(1).max(120),
        appt_at: z.string(),
        notes: z.string().max(1000).optional(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("appointments")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("appointments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Alerts ----------
export const listAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const dismissAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("alerts")
      .update({ is_read: true })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Check-ins ----------
export const listCheckins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("checkins")
      .select("*")
      .order("checkin_date", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getTodayCheckin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const date = new Date().toISOString().slice(0, 10);
    const { data, error } = await context.supabase
      .from("checkins")
      .select("*")
      .eq("checkin_date", date)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });
