"use client";

import { Video as VideoIcon } from "lucide-react";
import { GlassCard } from "@/components/ui";
import { timeAgo, formatDuration } from "@/lib/utils";
import type { VideoClipRow } from "@/lib/types";

/** A video clip tile: thumbnail (with duration badge) + caption + date. */
export function VideoClipCard({ clip }: { clip: VideoClipRow }) {
  const caption = clip.caption || clip.phrase || "Video";
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="relative flex aspect-square items-center justify-center bg-[var(--input)]">
        {clip.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.thumbnail_url}
            alt={caption}
            className="h-full w-full object-cover"
          />
        ) : (
          <VideoIcon className="h-8 w-8 text-[var(--muted)]" />
        )}
        <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {formatDuration(clip.duration ?? 0)}
        </span>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">{caption}</p>
        <p className="mt-0.5 text-[11px] text-[var(--muted)]">{timeAgo(clip.created_at)}</p>
      </div>
    </GlassCard>
  );
}
