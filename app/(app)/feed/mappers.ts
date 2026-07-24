/** Maps raw Supabase clip/story rows into the shared `Post` UI shape. */
import type {
  Post,
  ProfileRow,
  StoryRow,
  User,
  VideoClipRow,
  VoiceClipRow,
} from "@/lib/types";
import { fallbackWaveform, timeAgo } from "@/lib/utils";

/**
 * Viewer-relative state that a bare list query can't tell us: which posts this
 * user already liked and which authors they already follow. Resolved in one
 * extra round trip by `queries.ts` and threaded through here so cards render
 * correct affordances on first paint instead of defaulting to "not liked".
 */
export interface ViewerContext {
  likedIds: ReadonlySet<string>;
  followingIds: ReadonlySet<string>;
}

const EMPTY_VIEWER: ViewerContext = {
  likedIds: new Set(),
  followingIds: new Set(),
};

function mapUser(
  userId: string,
  profile: Partial<ProfileRow> | null | undefined,
  viewer: ViewerContext
): User {
  const id = profile?.id ?? userId;
  return {
    id,
    name: profile?.full_name || profile?.username || "User",
    username: profile?.username || "user",
    avatar: profile?.avatar_url ?? undefined,
    avatarUrl: profile?.avatar_url ?? undefined,
    language: profile?.primary_language ?? undefined,
    isVerified: profile?.is_verified ?? undefined,
    isFollowing: viewer.followingIds.has(id),
  };
}

export function mapVoiceClip(
  row: VoiceClipRow,
  viewer: ViewerContext = EMPTY_VIEWER
): Post {
  return {
    id: row.id,
    type: "voice",
    user: mapUser(row.user_id, row.profiles, viewer),
    content: {
      phrase: row.phrase ?? undefined,
      translation: row.translation ?? undefined,
      audioUrl: row.audio_url,
      duration: row.duration ?? undefined,
      audioWaveform: fallbackWaveform(row.id),
    },
    engagement: {
      likes: row.likes_count ?? 0,
      comments: row.comments_count ?? 0,
      shares: 0,
      validations: row.validations_count ?? 0,
      reposts: 0,
    },
    actions: {
      isLiked: viewer.likedIds.has(row.id),
      isValidated: row.is_validated ?? false,
      isReposted: false,
      needsValidation: !(row.is_validated ?? false),
    },
    timeAgo: timeAgo(row.created_at),
    createdAt: row.created_at,
  };
}

export function mapVideoClip(
  row: VideoClipRow,
  viewer: ViewerContext = EMPTY_VIEWER
): Post {
  return {
    id: row.id,
    type: "video",
    user: mapUser(row.user_id, row.profiles, viewer),
    content: {
      phrase: row.phrase ?? row.caption ?? undefined,
      translation: row.translation ?? undefined,
      videoUrl: row.video_url,
      videoThumbnail: row.thumbnail_url ?? undefined,
      duration: row.duration ?? undefined,
    },
    engagement: {
      likes: row.likes_count ?? 0,
      comments: row.comments_count ?? 0,
      shares: 0,
      validations: 0,
      reposts: 0,
    },
    actions: {
      isLiked: viewer.likedIds.has(row.id),
      isValidated: false,
      isReposted: false,
      needsValidation: false,
    },
    timeAgo: timeAgo(row.created_at),
    createdAt: row.created_at,
  };
}

export function mapStory(
  row: StoryRow,
  viewer: ViewerContext = EMPTY_VIEWER
): Post {
  // Stories don't declare engagement columns in `StoryRow`, but some rows may
  // still carry them at runtime — read defensively without assuming a schema.
  const extras = row as unknown as {
    likes_count?: number;
    comments_count?: number;
  };
  return {
    id: row.id,
    type: "story",
    user: mapUser(row.user_id, row.profiles, viewer),
    content: {
      // Mobile falls back to the caption for a story's display text.
      storyTitle: row.title ?? row.caption ?? undefined,
      videoThumbnail: row.thumbnail_url ?? row.media_url ?? undefined,
    },
    engagement: {
      likes: extras.likes_count ?? 0,
      comments: extras.comments_count ?? 0,
      shares: 0,
      validations: 0,
      reposts: 0,
    },
    actions: {
      isLiked: viewer.likedIds.has(row.id),
      isValidated: false,
      isReposted: false,
      needsValidation: false,
    },
    timeAgo: timeAgo(row.created_at),
    createdAt: row.created_at,
  };
}

/**
 * Mobile's trending rank (`getTrendingFeed` in src/utils/content.ts):
 * validations are worth 3x a like, comments 2x. Keeping the weights identical
 * means both clients surface the same posts as trending.
 */
export function engagementScore(post: Post): number {
  return (
    post.engagement.likes +
    post.engagement.comments * 2 +
    post.engagement.validations * 3
  );
}
