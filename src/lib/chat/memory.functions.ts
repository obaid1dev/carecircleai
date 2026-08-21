import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  getMemories,
  createMemory,
  deleteMemory,
  deleteAllMemories,
  type MemoryCategory,
} from "@/lib/chat/memory.server";

export const listMemories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return getMemories(context.supabase, context.userId);
  });

export const addMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (v: unknown) =>
      z
        .object({
          memory: z.string().min(1).max(500),
          category: z.enum([
            "general",
            "preference",
            "family",
            "routine",
            "health_context",
            "communication",
          ]),
        })
        .parse(v),
  )
  .handler(async ({ data, context }) => {
    return createMemory(context.supabase, context.userId, data.memory, data.category as MemoryCategory);
  });

export const removeMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ memoryId: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    await deleteMemory(context.supabase, context.userId, data.memoryId);
    return { ok: true };
  });

export const clearAllMemories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await deleteAllMemories(context.supabase, context.userId);
    return { ok: true };
  });
