"use client";

import { useEffect, useRef } from "react";
import type { Track } from "livekit-client";
import { cn } from "@/lib/utils";

/**
 * Attaches a LiveKit track to a media element. LiveKit hands us MediaStream
 * tracks rather than URLs, so attach/detach has to happen imperatively.
 */

export function VideoTrackView({
  track,
  mirror = false,
  className,
}: {
  track?: Track | null;
  mirror?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !track) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  if (!track) return null;

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={mirror}
      className={cn("h-full w-full object-cover", mirror && "-scale-x-100", className)}
    />
  );
}

export function AudioTrackView({ track }: { track?: Track | null }) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !track) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  if (!track) return null;
  // eslint-disable-next-line jsx-a11y/media-has-caption
  return <audio ref={ref} autoPlay />;
}
