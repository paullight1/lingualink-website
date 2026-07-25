"use client";

import { BookOpen } from "lucide-react";
import { GlassCard } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import type { StoryRow } from "@/lib/types";

/** A story tile: cover image + caption + date. */
export function StoryCard({ story }: { story: StoryRow }) {
  // `media_url` is the story itself and doubles as its cover; videos won't
  // render in an <img>, so those fall back to the placeholder icon.
  const isVideo = /\.(mp4|mov|m4v|webm)(\?|$)/i.test(story.media_url ?? "");
  const cover = !isVideo ? story.media_url || undefined : undefined;
  const label = story.caption?.trim();

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative flex aspect-[3/4] items-center justify-center bg-[var(--input)]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={label ?? "Story"} className="h-full w-full object-cover" />
        ) : (
          <BookOpen className="h-8 w-8 text-[var(--muted)]" />
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {label || "Untitled story"}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">{timeAgo(story.created_at)}</p>
      </div>
    </GlassCard>
  );
}
