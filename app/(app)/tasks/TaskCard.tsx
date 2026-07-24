"use client";

import { ArrowRight } from "lucide-react";
import { GlassCard, PrimaryButton } from "@/components/ui";
import type { Task } from "@/lib/types";
import { getDifficultyMeta } from "./difficultyMeta";

/** Single-task card: campaign + difficulty tags, instruction, reward, start CTA. */
export function TaskCard({
  task,
  starting,
  onStart,
}: {
  task: Task;
  starting: boolean;
  onStart: () => void;
}) {
  const difficultyMeta = getDifficultyMeta(
    task.difficulty ?? task.campaign?.difficulty_target
  );
  const currency = task.campaign?.currency || "NGN";
  const reward = task.campaign?.reward_per_task ?? 0;

  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <GlassCard className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
            {task.campaign?.title || "General Task"}
          </span>
          {difficultyMeta && (
            <span
              className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
              style={{
                color: difficultyMeta.color,
                backgroundColor: `${difficultyMeta.color}20`,
                borderColor: `${difficultyMeta.color}40`,
              }}
            >
              {difficultyMeta.emoji} {difficultyMeta.label}
            </span>
          )}
        </div>

        <p className="text-2xl leading-snug font-bold tracking-tight text-[var(--foreground)] sm:text-[26px]">
          {task.prompt_data?.instruction || "No instruction provided."}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">Reward:</span>
          <span className="text-xl font-bold text-[var(--success)]">
            {currency} {reward}
          </span>
        </div>
      </GlassCard>

      <PrimaryButton
        size="lg"
        loading={starting}
        rightIcon={!starting && <ArrowRight className="h-5 w-5" />}
        onClick={onStart}
      >
        Start Task
      </PrimaryButton>
    </div>
  );
}
