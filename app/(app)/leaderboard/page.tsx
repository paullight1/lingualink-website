"use client";

/** Owner: Agent 17 — leaderboard (timeframe pills, ranked list). Ported from mobile `src/screens/LeaderboardScreen.tsx`. */

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useCurrentUserId } from "@/lib/query/hooks";
import { qk } from "@/lib/query/keys";
import { AppHeader, SegmentedTabs, UserAvatar, EmptyState, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn, formatUsd } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";

const TIMEFRAMES = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "all_time", label: "All Time" },
] as const;

type TimeframeKey = (typeof TIMEFRAMES)[number]["key"];

/** Top-3 rank accent colors (gold / silver / bronze), matched to mobile RANK_COLORS. */
const RANK_COLORS: Record<number, string> = {
  1: "#F59E0B",
  2: "#94A3B8",
  3: "#B45309",
};

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  // NOTE: `total_earned` is a lifetime cumulative total on `profiles`, so
  // Daily/Weekly/Monthly are best-effort views onto the same ranking here —
  // there is no per-period earnings column to filter/aggregate on the client.
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, total_earned")
    .order("total_earned", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map((p, idx) => ({
    id: p.id,
    username: p.username,
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    total_earned: parseFloat(String(p.total_earned ?? 0)) || 0,
    rank: idx + 1,
  }));
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<TimeframeKey>("all_time");
  const currentUserId = useCurrentUserId();

  const { data: entries, isLoading } = useQuery({
    queryKey: qk.leaderboard(timeframe),
    queryFn: fetchLeaderboard,
    staleTime: 60_000,
  });

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Leaderboard" />

      <div className="border-b border-[var(--border-light)] px-4 py-3 sm:px-6">
        <SegmentedTabs
          variant="pill"
          tabs={TIMEFRAMES.map(({ key, label }) => ({ key, label }))}
          value={timeframe}
          onChange={(key) => setTimeframe(key as TimeframeKey)}
        />
      </div>

      <PageContainer size="md" className="flex-1 !px-0 sm:!px-0">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : !entries || entries.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-7 w-7" />}
            title="No contributors yet"
            message="Once people start earning, the top contributors will show up here."
          />
        ) : (
          <ul>
            {entries.map((entry) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                isCurrentUser={entry.id === currentUserId}
              />
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const rankColor = RANK_COLORS[entry.rank];
  const isTop3 = entry.rank <= 3;
  const name = entry.full_name || "Anonymous";

  return (
    <li>
      <Link
        href={`/u/${entry.id}`}
        className={cn(
          "flex items-center gap-3 border-b border-[var(--border-light)] px-4 py-3 transition-colors hover:bg-[var(--input)]/50 sm:px-6",
          isCurrentUser && "bg-[var(--color-primary)]/5"
        )}
      >
        <span
          className={cn(
            "w-7 shrink-0 text-center text-sm text-[var(--muted)]",
            isTop3 && "text-[15px] font-bold"
          )}
          style={isTop3 ? { color: rankColor } : undefined}
        >
          {entry.rank}
        </span>

        <div
          className="shrink-0 rounded-full"
          style={isTop3 ? { boxShadow: `0 0 0 2px ${rankColor}` } : undefined}
        >
          <UserAvatar uri={entry.avatar_url} name={name} size={40} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-[var(--foreground)]">
              {name}
            </span>
            {isCurrentUser && (
              <span className="shrink-0 rounded bg-[var(--color-primary)] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white">
                YOU
              </span>
            )}
          </div>
          <span className="block truncate text-xs text-[var(--muted)]">
            @{entry.username || "user"}
          </span>
        </div>

        <span
          className={cn(
            "shrink-0 text-sm font-semibold text-[var(--foreground)]",
            isTop3 && "text-[15px] font-extrabold"
          )}
          style={isTop3 ? { color: rankColor } : undefined}
        >
          {formatUsd(entry.total_earned)}
        </span>
      </Link>
    </li>
  );
}

function LeaderboardSkeleton() {
  return (
    <ul>
      {Array.from({ length: 10 }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 border-b border-[var(--border-light)] px-4 py-3 sm:px-6"
        >
          <Skeleton className="h-4 w-5" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-12" />
        </li>
      ))}
    </ul>
  );
}
