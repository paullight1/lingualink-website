"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Sparkles,
  MoreHorizontal,
  Play,
  CheckCircle2,
  BookOpen,
  Link as LinkIcon,
  Flag,
  Repeat2,
} from "lucide-react";
import toast from "react-hot-toast";
import { GlassCard, UserAvatar, WaveformPlayer } from "@/components/ui";
import { VoiceClipInteractions } from "./VoiceClipInteractions";
import { ReportModal } from "@/components/moderation/ReportModal";
import { CommentsSheet } from "@/components/comments/CommentsSheet";
import { supabase } from "@/lib/supabase/client";
import { cn, formatDuration } from "@/lib/utils";
import type { Post } from "@/lib/types";

/**
 * Shared feed post card — renders voice / video / story posts with header,
 * type-specific content, and the engagement row. Web port of the mobile
 * feed clip card (ModernHomeScreen renderClipItem) + VoiceClipInteractions.
 */
export interface FeedPostProps {
  post: Post;
  currentUserId?: string;
  onOpenProfile?: (userId: string) => void;
}

/** Maps a Post's UI type to the `likes.target_type` value used by Supabase. */
function targetTypeFor(type: Post["type"]): "voice_clip" | "video_clip" | "story" {
  if (type === "video") return "video_clip";
  if (type === "story") return "story";
  return "voice_clip";
}

export function FeedPost({ post, currentUserId, onOpenProfile }: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(post.actions.isLiked);
  const [likes, setLikes] = useState(post.engagement.likes);
  const [isFollowing, setIsFollowing] = useState(post.user.isFollowing ?? false);
  const [followBusy, setFollowBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(post.engagement.comments);

  const isSelf = !!currentUserId && currentUserId === post.user.id;

  const handleOpenProfile = () => onOpenProfile?.(post.user.id);

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Sign in to like posts");
      return;
    }
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    try {
      const targetType = targetTypeFor(post.type);
      if (nextLiked) {
        const { error } = await supabase
          .from("likes")
          .insert({ user_id: currentUserId, target_type: targetType, target_id: post.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("target_type", targetType)
          .eq("target_id", post.id);
        if (error) throw error;
      }
    } catch {
      // revert optimistic update on failure
      setIsLiked(!nextLiked);
      setLikes((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      toast.error("Couldn't update like");
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || isSelf || followBusy) return;
    setFollowBusy(true);
    const next = !isFollowing;
    setIsFollowing(next);
    try {
      if (next) {
        const { error } = await supabase
          .from("followers")
          .insert({ follower_id: currentUserId, following_id: post.user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", post.user.id);
        if (error) throw error;
      }
    } catch {
      setIsFollowing(!next);
      toast.error("Couldn't update follow");
    } finally {
      setFollowBusy(false);
    }
  };

  const handleCopyLink = async () => {
    setMenuOpen(false);
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  const handleReport = () => {
    setMenuOpen(false);
    if (!currentUserId) {
      toast.error("Sign in to report content");
      return;
    }
    setReportOpen(true);
  };

  return (
    <GlassCard intensity={15} className="rounded-[16px] border border-[var(--border-light)] p-5">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href={`/u/${post.user.id}`} onClick={handleOpenProfile} className="shrink-0">
            <UserAvatar uri={post.user.avatarUrl ?? post.user.avatar} name={post.user.name} size={40} />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/u/${post.user.id}`}
                onClick={handleOpenProfile}
                className="truncate font-semibold text-[var(--foreground)] hover:underline"
              >
                {post.user.name}
              </Link>
              {post.user.isVerified && (
                <BadgeCheck className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
              )}
              {post.isAIGenerated && (
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--color-accent-purple)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-accent-purple)]">
                  <Sparkles className="h-3 w-3" />
                  AI
                </span>
              )}
              {!isSelf && currentUserId && (
                <button
                  type="button"
                  onClick={handleFollow}
                  disabled={followBusy}
                  className={cn(
                    "ml-1 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition disabled:opacity-50",
                    isFollowing
                      ? "border border-[var(--border-light)] text-[var(--muted)]"
                      : "bg-brand-gradient text-white"
                  )}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
              {post.user.language && (
                <span className="rounded-md bg-[var(--color-primary)]/10 px-1.5 py-0.5 font-semibold text-[var(--color-primary)]">
                  {post.user.language}
                </span>
              )}
              <span>• {post.timeAgo}</span>
            </div>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-[16px] border border-[var(--border-light)] bg-[var(--card)] shadow-lg">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--input)]"
                >
                  <LinkIcon className="h-4 w-4" /> Copy link
                </button>
                <button
                  type="button"
                  onClick={handleReport}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--error)] hover:bg-[var(--input)]"
                >
                  <Flag className="h-4 w-4" /> Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {post.type === "voice" && (
        <div className="mb-4">
          {post.content.phrase && (
            <p className="mb-1 text-[17px] font-semibold text-[var(--foreground)]">
              {post.content.phrase}
            </p>
          )}
          {post.content.translation && (
            <p className="mb-3 text-sm italic text-[var(--muted)]">{post.content.translation}</p>
          )}
          <WaveformPlayer
            src={post.content.audioUrl}
            waveform={post.content.audioWaveform}
            duration={post.content.duration}
            seed={post.id}
          />
        </div>
      )}

      {post.type === "video" && (
        <div className="mb-4">
          {post.content.phrase && (
            <p className="mb-3 text-[17px] font-semibold text-[var(--foreground)]">
              {post.content.phrase}
            </p>
          )}
          <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-black">
            {videoPlaying && post.content.videoUrl ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                src={post.content.videoUrl}
                controls
                autoPlay
                className="h-full w-full object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => setVideoPlaying(true)}
                className="group absolute inset-0 h-full w-full"
              >
                {post.content.videoThumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.content.videoThumbnail}
                    alt=""
                    className="h-full w-full object-cover opacity-90 transition group-hover:opacity-75"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/30 backdrop-blur-sm">
                    <Play className="h-6 w-6 translate-x-0.5 text-white" fill="currentColor" />
                  </span>
                </span>
                {post.content.duration != null && (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                    {formatDuration(post.content.duration)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {post.type === "story" && (
        <div className="mb-4">
          <Link
            href={`/story/${post.id}`}
            className="relative block aspect-[9/13] w-full overflow-hidden rounded-[16px] bg-black"
          >
            {(post.content.videoThumbnail || post.user.avatarUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.content.videoThumbnail || post.user.avatarUrl}
                alt=""
                className="h-full w-full object-cover opacity-70"
              />
            )}
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 ring-1 ring-white/30 backdrop-blur-sm">
                <BookOpen className="h-6 w-6 text-white" />
              </span>
              <span className="text-base font-bold text-white">View Story</span>
              {post.content.storyTitle && (
                <span className="px-4 text-center text-sm text-white/80">
                  {post.content.storyTitle}
                </span>
              )}
            </span>
          </Link>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-3">
        <VoiceClipInteractions
          postId={post.id}
          likes={likes}
          comments={comments}
          isLiked={isLiked}
          onLike={handleLike}
          // `comments.voice_clip_id` means only voice clips can be commented on,
          // same as mobile.
          onComment={
            post.type === "voice" ? () => setCommentsOpen(true) : undefined
          }
        />
        <div className="flex items-center gap-1">
          {post.type === "voice" && !isSelf && (
            <Link
              href={`/duet/${post.id}`}
              aria-label="Duet this clip"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-[var(--color-accent-purple)] transition hover:bg-[var(--color-accent-purple)]/10"
            >
              <Repeat2 className="h-[18px] w-[18px]" />
            </Link>
          )}
          <Link
            href={`/validate/${post.id}`}
            aria-label="Validate this clip"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium text-[var(--color-accent-green)] transition hover:bg-[var(--color-accent-green)]/10"
          >
            <CheckCircle2 className="h-[18px] w-[18px]" />
            {post.engagement.validations > 0 && (
              <span className="tabular-nums">{post.engagement.validations}</span>
            )}
          </Link>
        </div>
      </div>

      {post.type === "voice" && (
        <CommentsSheet
          open={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          clipId={post.id}
          onCountChange={(delta) => setComments((c) => Math.max(0, c + delta))}
        />
      )}

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedUserId={post.user.id}
        postId={post.id}
        title="Report post"
      />
    </GlassCard>
  );
}
