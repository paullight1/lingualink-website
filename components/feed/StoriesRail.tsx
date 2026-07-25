"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { UserAvatar } from "@/components/ui";
import { useCurrentUserId, useMyProfile } from "@/lib/query/hooks";
import { getViewedStoryIds } from "@/lib/api/stories";
import { cn } from "@/lib/utils";
import type { StoryRow } from "@/lib/types";

/**
 * Horizontal rail of story avatars. Web port of the mobile StoriesRail:
 * one bubble per author (their latest active story), the viewer's own story
 * pinned first as an add/view affordance, and an orange ring on reels that
 * still have something unseen.
 */
export interface StoriesRailProps {
  stories: StoryRow[];
}

export function StoriesRail({ stories }: StoriesRailProps) {
  const currentUserId = useCurrentUserId();
  const { data: profile } = useMyProfile();

  // One bubble per author. `stories` arrives newest-first, so the first row
  // seen for a user is their latest.
  const { mine, others } = useMemo(() => {
    const latestByUser = new Map<string, StoryRow>();
    for (const story of stories) {
      if (!latestByUser.has(story.user_id)) latestByUser.set(story.user_id, story);
    }
    const all = [...latestByUser.values()];
    return {
      mine: all.find((s) => s.user_id === currentUserId) ?? null,
      others: all.filter((s) => s.user_id !== currentUserId),
    };
  }, [stories, currentUserId]);

  const { data: viewedIds } = useQuery({
    queryKey: ["story-views", currentUserId, stories.length],
    enabled: !!currentUserId && stories.length > 0,
    queryFn: () =>
      getViewedStoryIds(
        currentUserId,
        stories.map((s) => s.id)
      ),
  });

  const hasUnseen = (story: StoryRow) => !viewedIds?.has(story.id);

  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-3 no-scrollbar">
      {/* Your story — opens the reel if you have one, otherwise the composer. */}
      <Link
        href={mine ? `/story/${mine.id}` : "/story/new"}
        className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
      >
        <span className="relative">
          <UserAvatar
            uri={profile?.avatar_url}
            name={profile?.full_name || "You"}
            size={64}
            ring={!!mine && hasUnseen(mine)}
          />
          {!mine && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--background)] bg-brand-gradient text-white">
              <Plus className="h-3 w-3" />
            </span>
          )}
        </span>
        <span className="w-full truncate text-center text-xs font-medium text-[var(--foreground)]">
          Your story
        </span>
      </Link>

      {others.map((story) => {
        const name = story.profiles?.full_name || story.profiles?.username || "User";
        const unseen = hasUnseen(story);
        return (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
          >
            <UserAvatar
              uri={story.profiles?.avatar_url}
              name={name}
              size={64}
              ring={unseen}
            />
            <span
              className={cn(
                "w-full truncate text-center text-xs",
                unseen
                  ? "font-semibold text-[var(--foreground)]"
                  : "font-medium text-[var(--muted)]"
              )}
            >
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
