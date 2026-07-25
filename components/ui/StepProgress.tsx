"use client";

import { cn } from "@/lib/utils";

/**
 * The onboarding step meter. Carousel → profile setup → interests each drew
 * their own bar with different track colours, fills and label casing, so the
 * three screens of one flow looked like three different products. This is the
 * single one they all use.
 */
export interface StepProgressProps {
  /** 1-based. */
  step: number;
  total: number;
  /** Right-hand action, e.g. a Skip button. */
  action?: React.ReactNode;
  className?: string;
}

export function StepProgress({
  step,
  total,
  action,
  className,
}: StepProgressProps) {
  const pct = Math.min(100, Math.max(0, (step / total) * 100));

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[var(--muted-2)]">
            Step {step} of {total}
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Step ${step} of ${total}`}
          className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--input)]"
        >
          <div
            className="h-full rounded-full bg-brand-gradient transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {action}
    </div>
  );
}
