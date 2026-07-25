import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

const analysisSchema = z.object({
  mood_score: z.number(),
  risk_level: z.enum(["low", "medium", "high"]),
  medication_reported: z.boolean().nullable(),
  symptoms: z.array(z.string()),
  summary: z.string(),
});

export const finishCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ messages: z.array(messageSchema).min(1) }).parse(v))
  .handler(async ({ data, context }) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("Missing OPENROUTER_API_KEY");

    const transcript = data.messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
      .join("\n");

    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `Analyze this daily wellbeing check-in between an elderly user and an AI companion.

Return ONLY valid JSON, no code fences, matching:
{"mood_score": number 1-10, "risk_level": "low"|"medium"|"high", "medication_reported": true|false|null, "symptoms": string[], "summary": string}

Rules:
- risk_level medium/high if user reports pain, dizziness, confusion, sadness, missed medication, or worrying symptoms.
- medication_reported: true=took meds, false=missed, null=not mentioned.
- summary: 2-3 warm, factual sentences for family. No diagnosis.

Conversation:
${transcript}`;

    let analysis: z.infer<typeof analysisSchema>;
    try {
      const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash";
      const { text } = await generateText({
        model: gateway(model),
        prompt,
      });
      const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
      analysis = analysisSchema.parse(JSON.parse(cleaned));
    } catch {
      analysis = {
        mood_score: 5,
        risk_level: "low",
        medication_reported: null,
        symptoms: [],
        summary: "Check-in completed. AI summary unavailable.",
      };
    }

    const date = new Date().toISOString().slice(0, 10);
    const { error: upErr } = await context.supabase.from("checkins").upsert(
      {
        user_id: context.userId,
        checkin_date: date,
        messages: data.messages,
        mood_score: analysis.mood_score,
        risk_level: analysis.risk_level,
        medication_reported: analysis.medication_reported,
        symptoms: analysis.symptoms,
        ai_summary: analysis.summary,
      },
      { onConflict: "user_id,checkin_date" },
    );
    if (upErr) throw new Error(upErr.message);

    // Generate alert if medium/high risk
    if (analysis.risk_level === "medium" || analysis.risk_level === "high") {
      await context.supabase.from("alerts").insert({
        user_id: context.userId,
        alert_type: "wellbeing",
        severity: analysis.risk_level,
        message: analysis.summary,
      });
    }
    if (analysis.medication_reported === false) {
      await context.supabase.from("alerts").insert({
        user_id: context.userId,
        alert_type: "medication",
        severity: "medium",
        message: "User reported missing medication during today's check-in.",
      });
    }

    return analysis;
  });
