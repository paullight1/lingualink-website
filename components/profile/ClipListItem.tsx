"use client";

import { Heart, MessageCircle, Play, ShieldCheck, Video as VideoIcon } from "lucide-react";
import { WaveformPlayer } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import type { VoiceClipRow, VideoClipRow } from "@/lib/types";

export type ProfileClip =
  | ({ kind: "voice" } & VoiceClipRow)
  | ({ kind: "video" } & VideoClipRow);

/** One row in the My Clips list: WaveformPlayer for voice, thumbnail+play for video. */
export function ClipListItem({ clip }: { clip: ProfileClip }) {
  if (clip.kind === "voice") {
    const language = clip.dialect ? `${clip.language} · ${clip.dialect}` : clip.language;
    return (
      <div className="rounded-[16px] border border-[var(--border-light)] bg-[var(--surface)] p-3">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {clip.phrase || "Untitled clip"}
        </p>
        {clip.translation && (
          <p className="truncate text-xs text-[var(--muted)]">{clip.translation}</p>
        )}
        <WaveformPlayer
          src={clip.audio_url}
          duration={clip.duration ?? undefined}
          seed={clip.id}
          compact
          className="mt-2"
        />
        <ClipMeta clip={clip} language={language} />
      </div>
    );
  }

  const language = clip.language;
  return (
    <div className="flex items-start gap-3 rounded-[16px] border border-[var(--border-light)] bg-[var(--surface)] p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[12px] bg-[var(--input)]">
        {clip.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clip.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
            <VideoIcon className="h-6 w-6" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="h-5 w-5 text-white" fill="currentColor" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {clip.caption || clip.phrase || "Untitled video"}
        </p>
        <ClipMeta clip={clip} language={language} />
      </div>
    </div>
  );
}

function ClipMeta({ clip, language }: { clip: ProfileClip; language?: string | null }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
      <span className="flex items-center gap-1">
        <Heart className="h-3.5 w-3.5" />
        {clip.likes_count ?? 0}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle className="h-3.5 w-3.5" />
        {clip.comments_count ?? 0}
      </span>
      {clip.kind === "voice" && (
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          {clip.validations_count ?? 0}
        </span>
      )}
      {language && (
        <span
          className="rounded-full px-2 py-0.5 font-bold uppercase tracking-wide text-[var(--color-primary)]"
          style={{ backgroundColor: "#FF8A001A" }}
        >
          {language}
        </span>
      )}
      <span className="ml-auto shrink-0">{timeAgo(clip.created_at)}</span>
    </div>
  );
}
