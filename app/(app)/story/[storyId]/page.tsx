"use client";

/** Full-screen story viewer — the destination for the stories rail and feed story cards. */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MoreVertical, Trash2, Flag, X } from "lucide-react";
import toast from "react-hot-toast";

import { UserAvatar, Spinner, EmptyState, PrimaryButton } from "@/components/ui";
import { ReportModal } from "@/components/moderation/ReportModal";
import { useCurrentUserId } from "@/lib/query/hooks";
import { timeAgo } from "@/lib/utils";
import {
  deleteStory,
  getStoryById,
  getUserStories,
  isVideoUrl,
  markStoryViewed,
} from "@/lib/api/stories";

/** How long an image story stays on screen before advancing. */
const IMAGE_DURATION_MS = 5000;

export default function StoryViewerPage() {
  const params = useParams<{ storyId: string }>();
  const storyId = params.storyId;
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Opening one story opens that author's whole active reel, like mobile.
  const { data: entry, isLoading: entryLoading } = useQuery({
    queryKey: ["story", storyId],
    enabled: !!storyId,
    queryFn: () => getStoryById(storyId),
  });

  const authorId = entry?.user_id;

  const { data: stories, isLoading: reelLoading } = useQuery({
    queryKey: ["story-reel", authorId],
    enabled: !!authorId,
    queryFn: () => getUserStories(authorId as string),
  });

  const reel = stories ?? [];
  const current = reel[index];
  const isOwn = !!currentUserId && currentUserId === authorId;

  // Start on the story that was actually opened, not the top of the reel.
  useEffect(() => {
    if (!reel.length || !storyId) return;
    const found = reel.findIndex((s) => s.id === storyId);
    setIndex(found >= 0 ? found : 0);
  }, [reel, storyId]);

  const close = useCallback(() => router.back(), [router]);

  const goNext = useCallback(() => {
    setProgress(0);
    setIndex((i) => {
      if (i + 1 < reel.length) return i + 1;
      close();
      return i;
    });
  }, [reel.length, close]);

  const goPrev = useCallback(() => {
    setProgress(0);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Record the view once per story shown.
  useEffect(() => {
    if (current?.id && currentUserId) markStoryViewed(current.id, currentUserId);
  }, [current?.id, currentUserId]);

  // Image stories advance on a timer; video stories advance on `ended`.
  useEffect(() => {
    if (!current || paused) return;
    if (isVideoUrl(current.media_url)) return;

    setProgress(0);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const ratio = (Date.now() - startedAt) / IMAGE_DURATION_MS;
      if (ratio >= 1) {
        clearInterval(timer);
        goNext();
      } else {
        setProgress(ratio);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [current, paused, goNext]);

  // Keyboard controls for desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, close]);

  const handleDelete = async () => {
    if (!currentUserId || !current) return;
    setMenuOpen(false);
    if (!window.confirm("Delete this story?")) return;
    try {
      await deleteStory(current.id, currentUserId);
      toast.success("Story deleted");
      close();
    } catch {
      toast.error("Couldn't delete story");
    }
  };

  if (entryLoading || reelLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black">
        <Spinner />
      </div>
    );
  }

  if (!current) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black px-6">
        <EmptyState
          title="Story unavailable"
          message="This story may have expired — stories last 24 hours."
          action={
            <PrimaryButton onClick={() => router.push("/feed")}>
              Back to feed
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  const author = current.profiles;
  const authorName = author?.full_name || author?.username || "User";
  const isVideo = isVideoUrl(current.media_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative h-dvh w-full max-w-md overflow-hidden bg-black sm:h-[92dvh] sm:rounded-[24px]">
        {/* Segment progress bars */}
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-3">
          {reel.map((s, i) => (
            <div
              key={s.id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white transition-[width] duration-100 ease-linear"
                style={{
                  width:
                    i < index ? "100%" : i === index ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* Author header */}
        <div className="absolute inset-x-0 top-6 z-20 flex items-center gap-3 px-4 py-3">
          <Link href={`/u/${current.user_id}`} className="shrink-0">
            <UserAvatar uri={author?.avatar_url} name={authorName} size={36} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/u/${current.user_id}`}
              className="block truncate text-sm font-semibold text-white"
            >
              {authorName}
            </Link>
            <span className="text-xs text-white/70">
              {timeAgo(current.created_at)}
            </span>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Story options"
              className="rounded-full p-1.5 text-white/90 hover:bg-white/10"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-[16px] border border-[var(--border-light)] bg-[var(--card)] shadow-lg">
                  {isOwn ? (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--error)] hover:bg-[var(--input)]"
                    >
                      <Trash2 className="h-4 w-4" /> Delete story
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setReportOpen(true);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--error)] hover:bg-[var(--input)]"
                    >
                      <Flag className="h-4 w-4" /> Report
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close story"
            className="shrink-0 rounded-full p-1.5 text-white/90 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Media */}
        <div className="absolute inset-0">
          {isVideo ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              ref={videoRef}
              key={current.id}
              src={current.media_url}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
              onTimeUpdate={(e) => {
                const el = e.currentTarget;
                if (el.duration) setProgress(el.currentTime / el.duration);
              }}
              onEnded={goNext}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.id}
              src={current.media_url}
              alt={current.caption || "Story"}
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {/* Tap zones: left third goes back, right two-thirds advance. */}
        <button
          type="button"
          aria-label="Previous story"
          onClick={goPrev}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          className="absolute inset-y-0 left-0 z-10 w-1/3"
        />
        <button
          type="button"
          aria-label="Next story"
          onClick={goNext}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          className="absolute inset-y-0 right-0 z-10 w-2/3"
        />

        {/* Desktop arrows */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white sm:block"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white sm:block"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {current.caption && (
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-5 pb-8 pt-12">
            <p className="text-center text-[15px] font-medium text-white">
              {current.caption}
            </p>
          </div>
        )}
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedUserId={current.user_id}
        postId={current.id}
        title="Report story"
      />
    </div>
  );
}
