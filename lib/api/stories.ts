import { supabase } from "@/lib/supabase/client";
import { BUCKETS } from "@/lib/config";
import type { StoryRow } from "@/lib/types";

/**
 * Stories data layer, matching mobile `saveStory` (src/services/local/
 * offlineContent.ts) and StoryViewScreen: media lands in the `stories` bucket
 * under `{userId}/{timestamp}.{ext}`, the row carries `media_url` + `caption`,
 * and `expires_at` is 24h out. Views are upserted into `story_views`.
 */

const STORY_TTL_MS = 24 * 60 * 60 * 1000;
const PROFILE_JOIN = "*, profiles:user_id(*)";

/** Active stories by one user, oldest first — the order a viewer plays them in. */
export async function getUserStories(userId: string): Promise<StoryRow[]> {
  const { data, error } = await supabase
    .from("stories")
    .select(PROFILE_JOIN)
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[stories] user stories fetch failed", error);
    return [];
  }
  return (data as StoryRow[] | null) ?? [];
}

export async function getStoryById(storyId: string): Promise<StoryRow | null> {
  const { data, error } = await supabase
    .from("stories")
    .select(PROFILE_JOIN)
    .eq("id", storyId)
    .maybeSingle();

  if (error) {
    console.error("[stories] story fetch failed", error);
    return null;
  }
  return (data as StoryRow) ?? null;
}

/** Idempotent — a repeat view of the same story is a no-op upsert. */
export async function markStoryViewed(
  storyId: string,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from("story_views")
      .upsert({ story_id: storyId, user_id: userId });
  } catch {
    // Non-critical: failing to record a view shouldn't break playback.
  }
}

/** Story ids among `storyIds` that this user has already seen. */
export async function getViewedStoryIds(
  userId: string | null | undefined,
  storyIds: string[]
): Promise<Set<string>> {
  if (!userId || storyIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("story_views")
    .select("story_id")
    .eq("user_id", userId)
    .in("story_id", storyIds);

  if (error) {
    console.error("[stories] viewed lookup failed", error);
    return new Set();
  }
  return new Set(
    ((data as { story_id: string }[] | null) ?? []).map((r) => r.story_id)
  );
}

export interface CreateStoryInput {
  userId: string;
  file: Blob;
  caption?: string;
  /** File extension for the storage key, e.g. "jpg" or "mp4". */
  ext: string;
}

export async function createStory(input: CreateStoryInput): Promise<StoryRow> {
  const contentType = input.file.type || "application/octet-stream";
  const path = `${input.userId}/${Date.now()}.${input.ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKETS.stories)
    .upload(path, input.file, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data: pub } = supabase.storage
    .from(BUCKETS.stories)
    .getPublicUrl(path);
  const mediaUrl = pub?.publicUrl ?? `${BUCKETS.stories}/${path}`;

  const { data, error } = await supabase
    .from("stories")
    .insert({
      user_id: input.userId,
      media_url: mediaUrl,
      caption: input.caption || "",
      expires_at: new Date(Date.now() + STORY_TTL_MS).toISOString(),
    })
    .select(PROFILE_JOIN)
    .single();

  if (error) throw error;
  return data as StoryRow;
}

export async function deleteStory(
  storyId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Mobile decides image vs video by extension; same rule keeps them in sync. */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp4|mov|m4v|webm|avi|mkv)(\?|$)/i.test(url);
}
