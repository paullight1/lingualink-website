"use client";

import { useQuery } from "@tanstack/react-query";
import { Mic } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { EmptyState, Skeleton } from "@/components/ui";
import { ClipListItem, type ProfileClip } from "@/components/profile/ClipListItem";
import type { VoiceClipRow, VideoClipRow } from "@/lib/types";

/** Fetches the signed-in user's voice_clips + video_clips and merges them by recency. */
async function fetchMyClips(userId: string): Promise<ProfileClip[]> {
  const [voiceRes, videoRes] = await Promise.all([
    supabase
      .from("voice_clips")
      .select(
        "id, user_id, phrase, translation, language, dialect, audio_url, duration, created_at, likes_count, comments_count, validations_count, is_validated"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("video_clips")
      .select(
        "id, user_id, phrase, caption, translation, language, video_url, thumbnail_url, duration, created_at, likes_count, comments_count"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (voiceRes.error) throw voiceRes.error;
  if (videoRes.error) throw videoRes.error;

  const voice = ((voiceRes.data ?? []) as VoiceClipRow[]).map((c) => ({
    kind: "voice" as const,
    ...c,
  }));
  const video = ((videoRes.data ?? []) as VideoClipRow[]).map((c) => ({
    kind: "video" as const,
    ...c,
  }));

  return [...voice, ...video].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function ClipsTab({ userId }: { userId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-clips", userId],
    queryFn: () => fetchMyClips(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-[16px]" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<Mic className="h-7 w-7" />}
        title="Couldn't load clips"
        message="Something went wrong. Please try again."
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Mic className="h-7 w-7" />}
        title="No clips yet"
        message="Record a voice or video clip to see it here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((clip) => (
        <ClipListItem key={`${clip.kind}-${clip.id}`} clip={clip} />
      ))}
    </div>
  );
}
