"use client";

import { CheckCircle2 } from "lucide-react";
import type { MonetizationStatus } from "@/lib/types";

/** Follower-threshold progress bar toward unlocking validation rewards. Ported
 *  from mobile MonetizationProgressCard (simplified — no tier/registration badge,
 *  those fields aren't in the web MonetizationStatus type). */
export function MonetizationProgress({ status }: { status: MonetizationStatus }) {
  const threshold = status.threshold || status.target_followers_count || 1;
  const progress = Math.min(status.currentFollowers / threshold, 1);
  const percent = Math.min(Math.round(progress * 100), 100);
  const remaining = Math.max(0, threshold - status.currentFollowers);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-[var(--muted)]">
          <span className="text-lg font-bold text-[var(--foreground)]">
            {status.currentFollowers}
          </span>{" "}
          / {threshold} followers
        </p>
        <p className="text-sm font-bold text-[var(--success)]">{percent}%</p>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--input)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[var(--success)] transition-[width] duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 border-t border-[var(--border-light)] pt-3 text-center">
        {status.canMonetize ? (
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--success)]">
            <CheckCircle2 className="h-4 w-4" /> Validation rewards unlocked!
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Gain <span className="font-semibold text-[var(--foreground)]">{remaining}</span>{" "}
            more followers to unlock earning.
          </p>
        )}
      </div>
    </div>
  );
}
