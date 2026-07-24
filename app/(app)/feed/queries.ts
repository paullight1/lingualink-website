/** Supabase fetchers for the home feed's three tabs + stories rail. */
import { supabase } from "@/lib/supabase/client";
import type { Post, StoryRow, VideoClipRow, VoiceClipRow } from "@/lib/types";
import {
  engagementScore,
  mapStory,
  mapVideoClip,
  mapVoiceClip,
  type ViewerContext,
} from "./mappers";
import type { LiveStreamRow } from "./types";

const PROFILE_JOIN = "*, profiles:user_id(*)";
const PAGE_LIMIT = 24;

const EMPTY_VIEWER: ViewerContext = {
  likedIds: new Set(),
  followingIds: new Set(),
};

/**
 * Resolve which of these posts the viewer already liked and which authors they
 * already follow. Without this the feed renders every post as unliked and every
 * author as "Follow", and the first like tap tries to insert a duplicate row.
 */
async function loadViewerContext(
  viewerId: string | null | undefined,
  posts: Post[]
): Promise<ViewerContext> {
  if (!viewerId || posts.length === 0) return EMPTY_VIEWER;

  const postIds = posts.map((p) => p.id);
  const authorIds = [...new Set(posts.map((p) => p.user.id))].filter(
    (id) => id !== viewerId
  );

  const [likesRes, followsRes] = await Promise.all([
    supabase
      .from("likes")
      .select("target_id")
      .eq("user_id", viewerId)
      .in("target_id", postIds),
    authorIds.length
      ? supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", viewerId)
          .in("following_id", authorIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (likesRes.error) console.error("[feed] likes lookup failed", likesRes.error);
  if (followsRes.error)
    console.error("[feed] follows lookup failed", followsRes.error);

  return {
    likedIds: new Set(
      ((likesRes.data as { target_id: string }[] | null) ?? []).map(
        (r) => r.target_id
      )
    ),
    followingIds: new Set(
      ((followsRes.data as { following_id: string }[] | null) ?? []).map(
        (r) => r.following_id
      )
    ),
  };
}

/** Re-map rows now that viewer state is known. Cheap — no extra network. */
async function withViewerState(
  viewerId: string | null | undefined,
  voice: VoiceClipRow[],
  video: VideoClipRow[],
  stories: StoryRow[]
): Promise<Post[]> {
  const bare = [
    ...voice.map((r) => mapVoiceClip(r)),
    ...video.map((r) => mapVideoClip(r)),
    ...stories.map((r) => mapStory(r)),
  ];
  const viewer = await loadViewerContext(viewerId, bare);
  return [
    ...voice.map((r) => mapVoiceClip(r, viewer)),
    ...video.map((r) => mapVideoClip(r, viewer)),
    ...stories.map((r) => mapStory(r, viewer)),
  ];
}

/** Voice + video + story rows joined with the poster's profile, newest first. */
export async function fetchFeedPosts(viewerId?: string | null): Promise<Post[]> {
  const nowIso = new Date().toISOString();
  const [voiceRes, videoRes, storyRes] = await Promise.all([
    supabase
      .from("voice_clips")
      .select(PROFILE_JOIN)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
    supabase
      .from("video_clips")
      .select(PROFILE_JOIN)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
    supabase
      .from("stories")
      .select(PROFILE_JOIN)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(PAGE_LIMIT),
  ]);

  if (voiceRes.error) console.error("[feed] voice_clips fetch failed", voiceRes.error);
  if (videoRes.error) console.error("[feed] video_clips fetch failed", videoRes.error);
  if (storyRes.error) console.error("[feed] stories fetch failed", storyRes.error);

  const posts = await withViewerState(
    viewerId,
    (voiceRes.data as VoiceClipRow[] | null) ?? [],
    (videoRes.data as VideoClipRow[] | null) ?? [],
    (storyRes.data as StoryRow[] | null) ?? []
  );

  return posts.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

/**
 * Same three sources ranked by mobile's engagement score. Each table is
 * over-fetched (like mobile's `limit * 2`) because the ranking happens on the
 * merged list, not per-table — otherwise a highly-engaged older clip never
 * makes it into the candidate set.
 */
export async function fetchTrendingPosts(viewerId?: string | null): Promise<Post[]> {
  const nowIso = new Date().toISOString();
  const candidateLimit = PAGE_LIMIT * 2;
  const [voiceRes, videoRes, storyRes] = await Promise.all([
    supabase
      .from("voice_clips")
      .select(PROFILE_JOIN)
      .order("created_at", { ascending: false })
      .limit(candidateLimit),
    supabase
      .from("video_clips")
      .select(PROFILE_JOIN)
      .order("created_at", { ascending: false })
      .limit(candidateLimit),
    supabase
      .from("stories")
      .select(PROFILE_JOIN)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(candidateLimit),
  ]);

  if (voiceRes.error) console.error("[feed] trending voice_clips fetch failed", voiceRes.error);
  if (videoRes.error) console.error("[feed] trending video_clips fetch failed", videoRes.error);
  if (storyRes.error) console.error("[feed] trending stories fetch failed", storyRes.error);

  const posts = await withViewerState(
    viewerId,
    (voiceRes.data as VoiceClipRow[] | null) ?? [],
    (videoRes.data as VideoClipRow[] | null) ?? [],
    (storyRes.data as StoryRow[] | null) ?? []
  );

  return posts.sort((a, b) => engagementScore(b) - engagementScore(a));
}

/** Active (non-expired) stories for the StoriesRail, newest per user first. */
export async function fetchFeedStories(): Promise<StoryRow[]> {
  const { data, error } = await supabase
    .from("stories")
    .select(PROFILE_JOIN)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[feed] stories rail fetch failed", error);
    return [];
  }
  return (data as StoryRow[] | null) ?? [];
}

/** Currently-live streams, if any. */
export async function fetchLiveStreams(): Promise<LiveStreamRow[]> {
  try {
    const { data, error } = await supabase
      .from("live_streams")
      .select("*, profiles:user_id(*)")
      .eq("is_live", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[feed] live_streams fetch failed", error);
      return [];
    }
    return (data as LiveStreamRow[] | null) ?? [];
  } catch (err) {
    console.error("[feed] live_streams fetch threw", err);
    return [];
  }
}
