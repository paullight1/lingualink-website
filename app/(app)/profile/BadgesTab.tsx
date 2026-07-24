"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { badgesApi } from "@/lib/api/badges";
import { qk } from "@/lib/query/keys";
import { EmptyState, Skeleton } from "@/components/ui";
import { BadgeCard } from "@/components/profile/BadgeCard";

export function BadgesTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: qk.myBadges(),
    queryFn: () => badgesApi.getMyBadges(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-[16px]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Trophy className="h-7 w-7" />}
        title="Couldn't load badges"
        message="Something went wrong. Please try again."
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="h-7 w-7" />}
        title="No badges yet"
        message="Keep contributing to the community to earn badges."
      />
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {data.length} earned
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {data.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
