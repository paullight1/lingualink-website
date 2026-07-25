import { supabase } from "@/lib/supabase/client";
import type { Post, StoryRow, VideoClipRow, VoiceClipRow } from "@/lib/types";
import {
  mapStory,
  mapVideoClip,
  mapVoiceClip,
  type ViewerContext,
} from "../../feed/mappers";

const PROFILE_JOIN = "*, profiles:user_id(*)";

/**
 * A shared post URL carries only an id — the three content tables have
 * independent id spaces, so resolving one means trying each in turn. Voice
 * clips first since they're the most-shared type.
 */
export async function fetchPostById(
  postId: string,
  viewerId?: string | null
): Promise<Post | null> {
  const [voiceRes, videoRes, storyRes] = await Promise.all([
    supabase.from("voice_clips").select(PROFILE_JOIN).eq("id", postId).maybeSingle(),
    supabase.from("video_clips").select(PROFILE_JOIN).eq("id", postId).maybeSingle(),
    supabase.from("stories").select(PROFILE_JOIN).eq("id", postId).maybeSingle(),
  ]);

  const row =
    (voiceRes.data as VoiceClipRow | null) ??
    (videoRes.data as VideoClipRow | null) ??
    (storyRes.data as StoryRow | null);
  if (!row) return null;

  const viewer = await loadViewerContext(viewerId, postId, row.user_id);

  if (voiceRes.data) return mapVoiceClip(voiceRes.data as VoiceClipRow, viewer);
  if (videoRes.data) return mapVideoClip(videoRes.data as VideoClipRow, viewer);
  return mapStory(storyRes.data as StoryRow, viewer);
}

/** Whether the viewer already liked this post / follows its author. */
async function loadViewerContext(
  viewerId: string | null | undefined,
  postId: string,
  authorId: string
): Promise<ViewerContext> {
  const empty: ViewerContext = { likedIds: new Set(), followingIds: new Set() };
  if (!viewerId) return empty;

  const [likeRes, followRes] = await Promise.all([
    supabase
      .from("likes")
      .select("target_id")
      .eq("user_id", viewerId)
      .eq("target_id", postId)
      .maybeSingle(),
    viewerId === authorId
      ? Promise.resolve({ data: null })
      : supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", viewerId)
          .eq("following_id", authorId)
          .maybeSingle(),
  ]);

  return {
    likedIds: new Set(likeRes.data ? [postId] : []),
    followingIds: new Set(followRes.data ? [authorId] : []),
  };
}
