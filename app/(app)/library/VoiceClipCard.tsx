"use client";

import { Heart, MessageCircle, CheckCircle2 } from "lucide-react";
import { GlassCard, WaveformPlayer } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";
import type { VoiceClipRow } from "@/lib/types";
import { ManageMenu } from "./ManageMenu";

/** A voice clip row: phrase/translation/language/date + engagement counts + player + manage menu. */
export function VoiceClipCard({
  clip,
  onDelete,
  deleting,
}: {
  clip: VoiceClipRow;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <GlassCard className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[var(--foreground)]">
            {clip.phrase || "Untitled clip"}
          </p>
          {clip.translation && (
            <p className="truncate text-sm italic text-[var(--color-primary)]">
              {clip.translation}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[var(--muted)]">
            {clip.language && <span>{clip.language}</span>}
            {clip.language && <span aria-hidden>&middot;</span>}
            <span>{timeAgo(clip.created_at)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span className="flex items-center gap-1 text-xs font-medium text-[var(--muted)]">
            <Heart className="h-3.5 w-3.5" />
            {clip.likes_count ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-[var(--muted)]">
            <MessageCircle className="h-3.5 w-3.5" />
            {clip.comments_count ?? 0}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              clip.is_validated ? "text-[var(--success)]" : "text-[var(--muted)]"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {clip.validations_count ?? 0}
          </span>
          <ManageMenu onDelete={onDelete} deleting={deleting} />
        </div>
      </div>

      <WaveformPlayer
        src={clip.audio_url}
        duration={clip.duration ?? undefined}
        seed={clip.id}
        compact
      />
    </GlassCard>
  );
}
