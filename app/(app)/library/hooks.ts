"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";
import { qk } from "@/lib/query/keys";
import { BUCKETS } from "@/lib/config";
import { storagePathFromUrl } from "@/lib/storage";
import type { VoiceClipRow, VideoClipRow, StoryRow } from "@/lib/types";

/**
 * Data hooks for the Library page. Each tab fetches the signed-in user's own
 * rows (voice_clips / video_clips / stories), newest first, via React Query
 * keyed with the shared `qk.library` key so caches don't collide.
 */

async function fetchVoiceClips(userId: string): Promise<VoiceClipRow[]> {
  const { data, error } = await supabase
    .from("voice_clips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as VoiceClipRow[]) ?? [];
}

async function fetchVideoClips(userId: string): Promise<VideoClipRow[]> {
  const { data, error } = await supabase
    .from("video_clips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as VideoClipRow[]) ?? [];
}

async function fetchStories(userId: string): Promise<StoryRow[]> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as StoryRow[]) ?? [];
}

export function useVoiceClips(userId: string | null) {
  return useQuery({
    queryKey: qk.library(userId ?? "anon", "voice"),
    queryFn: () => fetchVoiceClips(userId as string),
    enabled: !!userId,
  });
}

export function useVideoClips(userId: string | null) {
  return useQuery({
    queryKey: qk.library(userId ?? "anon", "video"),
    queryFn: () => fetchVideoClips(userId as string),
    enabled: !!userId,
  });
}

export function useStories(userId: string | null) {
  return useQuery({
    queryKey: qk.library(userId ?? "anon", "story"),
    queryFn: () => fetchStories(userId as string),
    enabled: !!userId,
  });
}

/** Delete a voice clip: optimistic cache removal, DB delete, best-effort storage cleanup. */
export function useDeleteVoiceClip(userId: string | null) {
  const queryClient = useQueryClient();
  const key = qk.library(userId ?? "anon", "voice");

  return useMutation({
    mutationFn: async (clip: VoiceClipRow) => {
      if (!userId) throw new Error("Not signed in");

      const { error } = await supabase
        .from("voice_clips")
        .delete()
        .eq("id", clip.id)
        .eq("user_id", userId);
      if (error) throw error;

      // Best-effort storage cleanup. `audio_url` holds a full public URL, so
      // the bucket-relative path has to be recovered before removing.
      const path = storagePathFromUrl(BUCKETS.voiceClips, clip.audio_url);
      if (path) {
        try {
          await supabase.storage.from(BUCKETS.voiceClips).remove([path]);
        } catch {
          // ignore — the DB row is already gone, cleanup is best-effort
        }
      }
    },
    onMutate: async (clip) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<VoiceClipRow[]>(key);
      queryClient.setQueryData<VoiceClipRow[]>(key, (old) =>
        (old ?? []).filter((c) => c.id !== clip.id)
      );
      return { previous };
    },
    onError: (_err, _clip, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error("Failed to delete clip");
    },
    onSuccess: () => {
      toast.success("Clip deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });
}
