"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { EmptyState, Spinner } from "@/components/ui";
import { useCurrentUserId } from "@/lib/query/hooks";
import { useRealtime } from "@/lib/query/useRealtime";
import { getComments, getCommentReplies, type Comment } from "@/lib/api/comments";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";

/**
 * Comments list for a voice clip: paginated top-level comments, expandable
 * replies, and a composer. Web port of the mobile CommentsSection, including
 * its realtime subscription so comments posted from the Expo app appear live.
 *
 * Renders as a bottom sheet on mobile widths and a centered dialog on desktop.
 */

const PAGE_SIZE = 20;

export interface CommentsSheetProps {
  open: boolean;
  onClose: () => void;
  clipId: string;
  /** Lets the caller keep its own comment count badge in sync. */
  onCountChange?: (delta: number) => void;
}

export function CommentsSheet({
  open,
  onClose,
  clipId,
  onCountChange,
}: CommentsSheetProps) {
  const currentUserId = useCurrentUserId();

  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (reset: boolean) => {
      const offset = reset ? 0 : comments.length;
      const page = await getComments(clipId, currentUserId, PAGE_SIZE, offset);
      setHasMore(page.length === PAGE_SIZE);
      setComments((prev) => (reset ? page : [...prev, ...page]));
    },
    // `comments.length` is read at call time for the offset; including it here
    // would rebuild the callback on every append and re-trigger the load effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clipId, currentUserId]
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    load(true).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, load]);

  // Reset transient state when the sheet closes so reopening starts clean.
  useEffect(() => {
    if (open) return;
    setReplyingTo(null);
    setOpenReplies({});
    setReplies({});
  }, [open]);

  // Mirrors mobile's `comments-{clipId}` channel.
  useRealtime(
    `comments-${clipId}`,
    [{ table: "comments", filter: `voice_clip_id=eq.${clipId}` }],
    () => {
      load(true);
    },
    open
  );

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await load(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleReplies = async (commentId: string) => {
    const nextOpen = !openReplies[commentId];
    setOpenReplies((prev) => ({ ...prev, [commentId]: nextOpen }));
    if (nextOpen && !replies[commentId]) {
      const loaded = await getCommentReplies(commentId, currentUserId);
      setReplies((prev) => ({ ...prev, [commentId]: loaded }));
    }
  };

  const handleAdded = (comment: Comment) => {
    onCountChange?.(1);
    if (comment.parent_comment_id) {
      const parentId = comment.parent_comment_id;
      setReplies((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] ?? []), comment],
      }));
      setOpenReplies((prev) => ({ ...prev, [parentId]: true }));
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies_count: (c.replies_count ?? 0) + 1 }
            : c
        )
      );
      return;
    }
    setComments((prev) => [comment, ...prev]);
  };

  const handleDeleted = (commentId: string) => {
    onCountChange?.(-1);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setReplies((prev) => {
      const next: Record<string, Comment[]> = {};
      for (const [parentId, list] of Object.entries(prev)) {
        next[parentId] = list.filter((r) => r.id !== commentId);
      }
      return next;
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] border border-[var(--border-light)] bg-[var(--card)] sm:h-[70vh] sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Comments</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : comments.length === 0 ? (
            <EmptyState
              icon={<MessageCircle className="h-7 w-7" />}
              title="No comments yet"
              message="Be the first to say something."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-3">
                  <CommentItem
                    comment={comment}
                    currentUserId={currentUserId}
                    onReply={setReplyingTo}
                    onDeleted={handleDeleted}
                    repliesOpen={!!openReplies[comment.id]}
                    onToggleReplies={handleToggleReplies}
                  />
                  {openReplies[comment.id] &&
                    (replies[comment.id] ?? []).map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        currentUserId={currentUserId}
                        onDeleted={handleDeleted}
                        isReply
                      />
                    ))}
                </div>
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="mx-auto rounded-full px-4 py-2 text-sm font-semibold text-[var(--color-primary)] disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load more comments"}
                </button>
              )}
            </div>
          )}
        </div>

        <CommentInput
          clipId={clipId}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          onCommentAdded={handleAdded}
        />
      </div>
    </div>
  );
}
