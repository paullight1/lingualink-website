"use client";

/** Single post permalink — the destination for Copy link / Share from a feed card. */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { AppHeader, EmptyState, PrimaryButton, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { FeedPost } from "@/components/feed/FeedPost";
import { CommentItem } from "@/components/comments/CommentItem";
import { CommentInput } from "@/components/comments/CommentInput";
import { useCurrentUserId } from "@/lib/query/hooks";
import { useRealtime } from "@/lib/query/useRealtime";
import { getComments, getCommentReplies, type Comment } from "@/lib/api/comments";
import { fetchPostById } from "./queries";

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const postId = params.postId;
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const {
    data: post,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["post", postId, currentUserId ?? "anon"],
    enabled: !!postId,
    queryFn: () => fetchPostById(postId, currentUserId),
  });

  const isVoice = post?.type === "voice";

  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

  const commentsQuery = useQuery({
    queryKey: ["post-comments", postId, currentUserId ?? "anon"],
    enabled: !!postId && isVoice,
    queryFn: () => getComments(postId, currentUserId, 50, 0),
  });

  useRealtime(
    `comments-${postId}`,
    [{ table: "comments", filter: `voice_clip_id=eq.${postId}` }],
    () => commentsQuery.refetch(),
    isVoice
  );

  const handleToggleReplies = async (commentId: string) => {
    const nextOpen = !openReplies[commentId];
    setOpenReplies((prev) => ({ ...prev, [commentId]: nextOpen }));
    if (nextOpen && !replies[commentId]) {
      const loaded = await getCommentReplies(commentId, currentUserId);
      setReplies((prev) => ({ ...prev, [commentId]: loaded }));
    }
  };

  const comments = commentsQuery.data ?? [];

  return (
    <div className="min-h-full">
      <AppHeader title="Post" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        {isLoading ? (
          <Skeleton className="h-64 w-full rounded-[16px]" />
        ) : isError || !post ? (
          <EmptyState
            title="Post not found"
            message="This post may have been removed, or the link is out of date."
            action={
              <PrimaryButton onClick={() => router.push("/feed")}>
                Back to feed
              </PrimaryButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            <FeedPost post={post} currentUserId={currentUserId ?? undefined} />

            {isVoice && (
              <section aria-label="Comments">
                <h2 className="mb-3 px-1 text-sm font-bold text-[var(--foreground)]">
                  {comments.length > 0
                    ? `${comments.length} ${
                        comments.length === 1 ? "comment" : "comments"
                      }`
                    : "Comments"}
                </h2>

                {commentsQuery.isLoading ? (
                  <Skeleton className="h-24 w-full rounded-[16px]" />
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
                          onDeleted={() => commentsQuery.refetch()}
                          repliesOpen={!!openReplies[comment.id]}
                          onToggleReplies={handleToggleReplies}
                        />
                        {openReplies[comment.id] &&
                          (replies[comment.id] ?? []).map((reply) => (
                            <CommentItem
                              key={reply.id}
                              comment={reply}
                              currentUserId={currentUserId}
                              onDeleted={() => commentsQuery.refetch()}
                              isReply
                            />
                          ))}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 overflow-hidden rounded-[16px] border border-[var(--border-light)]">
                  <CommentInput
                    clipId={postId}
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                    onCommentAdded={() => {
                      setReplyingTo(null);
                      commentsQuery.refetch();
                    }}
                  />
                </div>
              </section>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
