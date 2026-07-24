"use client";

import Link from "next/link";
import { UserAvatar } from "@/components/ui";
import type { StoryRow } from "@/lib/types";

/**
 * Horizontal rail of story avatars with an orange ring (unseen indicator).
 * Web port of the mobile StoriesRail, simplified to the "other users'"
 * stories the feed page passes in — renders nothing when empty.
 */
export interface StoriesRailProps {
  stories: StoryRow[];
}

export function StoriesRail({ stories }: StoriesRailProps) {
  if (!stories.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-3 no-scrollbar">
      {stories.map((story) => {
        const name = story.profiles?.full_name || story.profiles?.username || "User";
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
              ring
            />
            <span className="w-full truncate text-center text-xs font-medium text-[var(--foreground)]">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
