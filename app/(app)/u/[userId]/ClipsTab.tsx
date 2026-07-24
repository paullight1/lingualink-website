"use client";

import { Heart, MessageSquare, CheckCircle2, Mic } from "lucide-react";
import { GlassCard, EmptyState, Skeleton, WaveformPlayer } from "@/components/ui";
import { timeAgo } from "@/lib/utils";
import { useUserClips, type UserClipItem } from "./hooks";

function ClipCard({ clip }: { clip: UserClipItem }) {
  const phrase = clip.phrase || (clip.kind === "video" ? clip.caption : null) || "Untitled";
  const language = "dialect" in clip && clip.dialect ? `${clip.language} / ${clip.dialect}` : clip.language || "Unknown";

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-[var(--foreground)]">{phrase}</p>
        <span className="shrink-0 text-xs text-[var(--muted)]">{timeAgo(clip.created_at)}</span>
      </div>
      <p className="mt-0.5 text-xs font-medium text-[var(--color-primary)]">{language}</p>

      <div className="mt-3">
        {clip.kind === "voice" ? (
          <WaveformPlayer src={clip.audio_url} duration={clip.duration ?? undefined} seed={clip.id} />
        ) : (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[var(--input)]">
            {clip.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={clip.thumbnail_url}
                alt={phrase}
                className="h-full w-full object-cover"
              />
            ) : (
              <video src={clip.video_url} className="h-full w-full object-cover" muted preload="metadata" />
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-[var(--border-light)] pt-3 text-xs text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5" /> {clip.likes_count ?? 0}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> {clip.comments_count ?? 0}
        </span>
        {clip.kind === "voice" && (
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> {clip.validations_count ?? 0}
          </span>
        )}
      </div>
    </GlassCard>
  );
}

/** "Clips" tab of the other-user profile: this user's voice + video clips. */
export function ClipsTab({ userId }: { userId: string }) {
  const { data: clips, isLoading, isError } = useUserClips(userId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-[16px]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <EmptyState title="Couldn't load clips" message="Please try again later." />;
  }

  if (!clips || clips.length === 0) {
    return (
      <EmptyState
        icon={<Mic className="h-7 w-7" />}
        title="No clips yet"
        message="This user hasn't shared any clips yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      {clips.map((clip) => (
        <ClipCard key={`${clip.kind}-${clip.id}`} clip={clip} />
      ))}
    </div>
  );
}
