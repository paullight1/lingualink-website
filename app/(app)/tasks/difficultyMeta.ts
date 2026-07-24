import type { DifficultyLevel } from "@/lib/types";

/**
 * Difficulty tag styling, ported from mobile `TaskService.DIFFICULTY_META`.
 * Keyed loosely so both the mobile ("easy"/"expert") and web ("basic") naming
 * schemes resolve to a sensible pill.
 */
export interface DifficultyMeta {
  label: string;
  emoji: string;
  color: string;
}

const META: Record<string, DifficultyMeta> = {
  easy: { label: "Easy", emoji: "🟢", color: "#22C55E" },
  basic: { label: "Basic", emoji: "🟢", color: "#22C55E" },
  intermediate: { label: "Intermediate", emoji: "🟡", color: "#F59E0B" },
  advanced: { label: "Advanced", emoji: "🔴", color: "#EF4444" },
  expert: { label: "Expert", emoji: "🔵", color: "#3B82F6" },
};

export function getDifficultyMeta(
  level?: DifficultyLevel | null
): DifficultyMeta | null {
  if (!level) return null;
  return META[level.toLowerCase()] ?? { label: level, emoji: "⚪", color: "#8B5CF6" };
}
