"use client";

import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

/**
 * Engagement row for a feed post — like / comment count / share.
 * Web port of the mobile VoiceClipInteractions (like + comment + share subset;
 * duet/validate live in FeedPost since they need clip-type-specific routing).
 */
export interface VoiceClipInteractionsProps {
  postId: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  onLike: () => void;
}

function ActionButton({
  active,
  onClick,
  icon,
  count,
  label,
}: {
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  count?: number;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition active:scale-95",
        active
          ? "text-[var(--color-primary)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]"
      )}
    >
      {icon}
      {count !== undefined && count > 0 && (
        <span className="tabular-nums">{count}</span>
      )}
    </button>
  );
}

export function VoiceClipInteractions({
  postId,
  likes,
  comments,
  isLiked,
  onLike,
}: VoiceClipInteractionsProps) {
  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/post/${postId}`
        : `/post/${postId}`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      // user cancelled share sheet — no-op
    }
  };

  return (
    <div className="flex items-center gap-1">
      <ActionButton
        active={isLiked}
        onClick={onLike}
        label="Like"
        count={likes}
        icon={
          <ThumbsUp
            className="h-[18px] w-[18px]"
            fill={isLiked ? "currentColor" : "none"}
          />
        }
      />
      <ActionButton
        label="Comments"
        count={comments}
        icon={<MessageCircle className="h-[18px] w-[18px]" />}
      />
      <ActionButton
        onClick={handleShare}
        label="Share"
        icon={<Share2 className="h-[18px] w-[18px]" />}
      />
    </div>
  );
}
