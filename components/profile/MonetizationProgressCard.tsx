import { CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui";
import type { MonetizationStatus } from "@/lib/types";

/** Web port of the mobile MonetizationProgressCard: followers-to-threshold progress bar. */
export function MonetizationProgressCard({ status }: { status: MonetizationStatus }) {
  const threshold = Math.max(1, status.threshold);
  const pct = Math.min(100, Math.round((status.currentFollowers / threshold) * 100));

  return (
    <GlassCard className="p-5">
      <div className="mb-4">
        <h3 className="text-base font-bold text-[var(--foreground)]">
          Monetization Status
        </h3>
        <p className="text-xs text-[var(--muted)]">
          Grow your audience to unlock validation earnings
        </p>
      </div>

      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-[var(--muted)]">
          <span className="text-lg font-bold text-[var(--foreground)]">
            {status.currentFollowers}
          </span>{" "}
          / {status.threshold} followers
        </p>
        <span className="text-sm font-bold text-[var(--success)]">{pct}%</span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--input)]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: "var(--success)" }}
        />
      </div>

      <div className="mt-4 border-t border-[var(--border-light)] pt-4 text-center">
        {status.canMonetize ? (
          <p className="flex items-center justify-center gap-2 text-sm font-semibold text-[var(--success)]">
            <CheckCircle2 className="h-4 w-4" /> Earnings unlocked
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            Gain{" "}
            <span className="font-bold text-[var(--foreground)]">
              {Math.max(0, status.followersNeeded)}
            </span>{" "}
            more followers to unlock earning.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
