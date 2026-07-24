"use client";

import { cn } from "@/lib/utils";

export interface Stat {
  label: string;
  value: string | number;
  onClick?: () => void;
}

/** Horizontal stat row (Followers / Following / Clips). */
export function StatRow({
  stats,
  className,
}: {
  stats: Stat[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      {stats.map((s, i) => (
        <button
          key={s.label}
          onClick={s.onClick}
          disabled={!s.onClick}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 px-2 disabled:cursor-default",
            i > 0 && "border-l border-[var(--border-light)]"
          )}
        >
          <span className="text-lg font-bold text-[var(--foreground)]">
            {s.value}
          </span>
          <span className="text-xs text-[var(--muted)]">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
