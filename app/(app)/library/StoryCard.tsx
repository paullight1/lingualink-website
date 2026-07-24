"use client";

import { BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import type { StoryRow } from "@/lib/types";

/** A story tile: cover image + title + date. */
export function StoryCard({ story }: { story: StoryRow }) {
  const cover = story.thumbnail_url || undefined;
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative flex aspect-[3/4] items-center justify-center bg-[var(--input)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={story.title ?? "Story"} className="h-full w-full object-cover" />
        ) : (
          <BookOpen className="h-8 w-8 text-[var(--muted)]" />
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {story.title || "Untitled story"}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">{timeAgo(story.created_at)}</p>
      </div>
    </GlassCard>
  );
}
