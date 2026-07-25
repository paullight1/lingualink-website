"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { UserAvatar, WaveformPlayer } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";
import { deleteComment, toggleCommentLike, type Comment } from "@/lib/api/comments";

/**
 * A single comment: author, body (text and/or voice note), like, reply, and
 * a delete affordance on your own. Web port of the mobile CommentItem.
 */
export interface CommentItemProps {
  comment: Comment;
  currentUserId?: string | null;
  onReply?: (comment: Comment) => void;
  onDeleted?: (commentId: string) => void;
  /** Replies render inline without their own reply/expand affordances. */
  isReply?: boolean;
  repliesOpen?: boolean;
  onToggleReplies?: (commentId: string) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDeleted,
  isReply = false,
  repliesOpen = false,
  onToggleReplies,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(!!comment.is_liked_by_current_user);
  const [likes, setLikes] = useState(comment.likes_count ?? 0);
  const [deleting, setDeleting] = useState(false);

  const isOwn = !!currentUserId && currentUserId === comment.user_id;
  const displayName = comment.user.full_name || comment.user.username || "User";

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Sign in to like comments");
      return;
    }
    const next = !isLiked;
    setIsLiked(next);
    setLikes((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      await toggleCommentLike(comment.id, currentUserId, isLiked);
    } catch {
      setIsLiked(!next);
      setLikes((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error("Couldn't update like");
    }
  };

  const handleDelete = async () => {
    if (!currentUserId || deleting) return;
    if (!window.confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id, currentUserId);
      onDeleted?.(comment.id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Couldn't delete comment");
      setDeleting(false);
    }
  };

  return (
    <div className={cn("flex gap-3", isReply && "pl-4")}>
      <Link href={`/u/${comment.user_id}`} className="shrink-0">
        <UserAvatar
          uri={comment.user.avatar_url ?? undefined}
          name={displayName}
          size={isReply ? 28 : 34}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-[16px] bg-[var(--input)] px-3.5 py-2.5">
          <div className="flex items-baseline gap-2">
            <Link
              href={`/u/${comment.user_id}`}
              className="truncate text-sm font-semibold text-[var(--foreground)] hover:underline"
            >
              {displayName}
            </Link>
            <span className="shrink-0 text-[11px] text-[var(--muted)]">
              {timeAgo(comment.created_at)}
            </span>
          </div>

          {comment.content && (
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-[var(--foreground)]">
              {comment.content}
            </p>
          )}

          {comment.audio_url && (
            <div className="mt-2">
              <WaveformPlayer
                src={comment.audio_url}
                duration={comment.audio_duration ?? undefined}
                seed={comment.id}
                compact
              />
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 px-1">
          <button
            type="button"
            onClick={handleLike}
            aria-label={isLiked ? "Unlike comment" : "Like comment"}
            aria-pressed={isLiked}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition active:scale-95",
              isLiked
                ? "text-[var(--color-primary)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            <Heart className="h-3.5 w-3.5" fill={isLiked ? "currentColor" : "none"} />
            {likes > 0 && <span className="tabular-nums">{likes}</span>}
          </button>

          {!isReply && (
            <button
              type="button"
              onClick={() => onReply?.(comment)}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Reply
            </button>
          )}

          {isOwn && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete comment"
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--error)] disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {!isReply && comment.replies_count > 0 && (
          <button
            type="button"
            onClick={() => onToggleReplies?.(comment.id)}
            className="mt-1 flex items-center gap-1 px-1 text-xs font-semibold text-[var(--color-primary)]"
          >
            {repliesOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {repliesOpen
              ? "Hide replies"
              : `${comment.replies_count} ${
                  comment.replies_count === 1 ? "reply" : "replies"
                }`}
          </button>
        )}
      </div>
    </div>
  );
}
