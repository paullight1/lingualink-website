import { supabase } from "@/lib/supabase/client";

/**
 * Comments data layer. Table shape and column names are taken verbatim from
 * mobile `src/utils/interactions.ts` so comments written by either client are
 * interchangeable. Comments hang off `voice_clip_id` only — that's the schema,
 * and it's why the mobile app shows comments on voice clips exclusively.
 *
 * One deliberate difference from mobile: the viewer's like state for a page of
 * comments is resolved in a single batched query rather than one query per
 * comment. Same result, without the N+1.
 */

const PROFILE_JOIN = `
  *,
  profiles!comments_user_id_fkey (
    id,
    username,
    full_name,
    avatar_url
  )
`;

export interface CommentAuthor {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string | null;
}

export interface Comment {
  id: string;
  voice_clip_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  content: string;
  audio_url?: string | null;
  audio_duration?: number | null;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  user: CommentAuthor;
  is_liked_by_current_user?: boolean;
}

/** Raw row before the `profiles` join is flattened onto `user`. */
type CommentRow = Omit<Comment, "user" | "is_liked_by_current_user"> & {
  profiles: CommentAuthor | null;
};

/** One query for all of this page's comment likes instead of one per comment. */
async function likedCommentIds(
  viewerId: string | null | undefined,
  commentIds: string[]
): Promise<Set<string>> {
  if (!viewerId || commentIds.length === 0) return new Set();

  const { data, error } = await supabase
    .from("likes")
    .select("target_id")
    .eq("user_id", viewerId)
    .eq("target_type", "comment")
    .in("target_id", commentIds);

  if (error) {
    console.error("[comments] like lookup failed", error);
    return new Set();
  }
  return new Set(
    ((data as { target_id: string }[] | null) ?? []).map((r) => r.target_id)
  );
}

function toComment(row: CommentRow, liked: ReadonlySet<string>): Comment {
  const { profiles, ...rest } = row;
  return {
    ...rest,
    user: profiles ?? {
      id: row.user_id,
      username: "user",
      full_name: "User",
      avatar_url: null,
    },
    is_liked_by_current_user: liked.has(row.id),
  };
}

async function hydrate(
  rows: CommentRow[],
  viewerId: string | null | undefined
): Promise<Comment[]> {
  const liked = await likedCommentIds(
    viewerId,
    rows.map((r) => r.id)
  );
  return rows.map((row) => toComment(row, liked));
}

/** Top-level comments on a clip, newest first. */
export async function getComments(
  clipId: string,
  viewerId?: string | null,
  limit = 20,
  offset = 0
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(PROFILE_JOIN)
    .eq("voice_clip_id", clipId)
    .is("parent_comment_id", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[comments] fetch failed", error);
    return [];
  }
  return hydrate((data as CommentRow[] | null) ?? [], viewerId);
}

/** Replies to a comment, oldest first (reads as a conversation). */
export async function getCommentReplies(
  commentId: string,
  viewerId?: string | null,
  limit = 10,
  offset = 0
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(PROFILE_JOIN)
    .eq("parent_comment_id", commentId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[comments] replies fetch failed", error);
    return [];
  }
  return hydrate((data as CommentRow[] | null) ?? [], viewerId);
}

export async function createComment(input: {
  clipId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
}): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      voice_clip_id: input.clipId,
      user_id: input.userId,
      parent_comment_id: input.parentCommentId || null,
      content: input.content,
      audio_url: input.audioUrl || null,
      audio_duration: input.audioDuration || null,
    })
    .select(PROFILE_JOIN)
    .single();

  if (error) throw error;
  return toComment(data as CommentRow, new Set());
}

export async function updateComment(
  commentId: string,
  userId: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from("comments")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", commentId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Toggle the viewer's like on a comment. Returns the resulting state. */
export async function toggleCommentLike(
  commentId: string,
  userId: string,
  currentlyLiked: boolean
): Promise<boolean> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("target_type", "comment")
      .eq("target_id", commentId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from("likes").insert({
    user_id: userId,
    target_type: "comment",
    target_id: commentId,
  });
  if (error) throw error;
  return true;
}
