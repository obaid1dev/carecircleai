"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Trash2, X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  listMemories,
  addMemory,
  removeMemory,
  clearAllMemories,
} from "@/lib/chat/memory.functions";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "preference", label: "Preference" },
  { value: "family", label: "Family" },
  { value: "routine", label: "Routine" },
  { value: "health_context", label: "Health" },
  { value: "communication", label: "Communication" },
] as const;

type MemoryCategory = (typeof CATEGORIES)[number]["value"];

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  preference: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  family: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  routine: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  health_context: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  communication: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

export function MemoryManager() {
  const qc = useQueryClient();
  const [newMemory, setNewMemory] = useState("");
  const [newCategory, setNewCategory] = useState<string>("general");
  const [confirmClear, setConfirmClear] = useState(false);

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ["memories"],
    queryFn: () => listMemories(),
  });

  const addMut = useMutation({
    mutationFn: () =>
      addMemory({ data: { memory: newMemory, category: newCategory as MemoryCategory } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      setNewMemory("");
      toast.success("Memory saved");
    },
    onError: () => toast.error("Failed to save memory"),
  });

  const deleteMut = useMutation({
    mutationFn: (memoryId: string) => removeMemory({ data: { memoryId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      toast.success("Memory deleted");
    },
  });

  const clearMut = useMutation({
    mutationFn: () => clearAllMemories(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      setConfirmClear(false);
      toast.success("All memories cleared");
    },
  });

  return (
    <Card className="glass rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="inline-flex w-9 h-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Brain className="w-4 h-4" />
          </span>
          AI Memory
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          CareCircle remembers these details across conversations.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new memory */}
        <div className="flex gap-2">
          <Input
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="Add a memory..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newMemory.trim()) addMut.mutate();
            }}
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            onClick={() => addMut.mutate()}
            disabled={!newMemory.trim() || addMut.isPending}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Memory list */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading memories...</p>
        ) : memories.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No memories yet. CareCircle will automatically remember useful details from your
            conversations, or you can add them manually above.
          </p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {memories.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 rounded-xl border border-border bg-background/60 px-3 py-2.5"
                >
                  <span
                    className={`shrink-0 mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[m.category] ?? CATEGORY_COLORS.general}`}
                  >
                    <Tag className="w-3 h-3" />
                    {m.category}
                  </span>
                  <span className="flex-1 text-sm">{m.memory}</span>
                  <button
                    onClick={() => deleteMut.mutate(m.id)}
                    className="shrink-0 mt-0.5 p-1 rounded-md text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Clear all */}
        {memories.length > 0 && (
          <div className="pt-2 border-t border-border/60">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-destructive">
                  Clear all {memories.length} memories?
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => clearMut.mutate()}
                  disabled={clearMut.isPending}
                >
                  Yes, clear all
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmClear(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear all memories
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
