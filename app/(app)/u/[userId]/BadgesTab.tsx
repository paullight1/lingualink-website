"use client";

import { Medal } from "lucide-react";
import { EmptyState, GlassCard, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { BadgeTier } from "@/lib/types";
import { useUserBadgesTab } from "./hooks";

const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  diamond: "#B9F2FF",
};

/** "Badges" tab of the other-user profile: earned badges grid. */
export function BadgesTab({ userId }: { userId: string }) {
  const { data: badges, isLoading, isError } = useUserBadgesTab(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-[16px]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Couldn't load badges" message="Please try again later." />;
  }

  if (!badges || badges.length === 0) {
    return (
      <EmptyState
        icon={<Medal className="h-7 w-7" />}
        title="No badges yet"
        message="This user hasn't earned any badges yet."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {badges.map((badge) => {
        const tierColor = badge.tier ? TIER_COLORS[badge.tier] : "var(--color-primary)";
        return (
          <GlassCard
            key={badge.id}
            className="flex flex-col items-center justify-between gap-2 p-3 text-center"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: `${tierColor}26` }}
            >
              <Medal className="h-6 w-6" style={{ color: tierColor }} />
            </div>
            <p className="line-clamp-1 text-xs font-semibold text-[var(--foreground)]">
              {badge.name}
            </p>
            {badge.tier && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black"
                )}
                style={{ backgroundColor: tierColor }}
              >
                {badge.tier}
              </span>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}
