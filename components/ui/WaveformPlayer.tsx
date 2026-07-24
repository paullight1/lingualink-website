"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration, fallbackWaveform } from "@/lib/utils";

/**
 * Audio player with a round orange play/pause button and animated waveform bars.
 * The core voice-clip playback control used in feed, library, validation.
 */
export interface WaveformPlayerProps {
  src?: string | null;
  waveform?: number[];
  duration?: number;
  seed?: string; // for a deterministic fallback waveform
  className?: string;
  compact?: boolean;
}

export function WaveformPlayer({
  src,
  waveform,
  duration,
  seed = "clip",
  className,
  compact,
}: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const bars = waveform?.length ? waveform : fallbackWaveform(seed, compact ? 20 : 28);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () =>
      setProgress(el.duration ? el.currentTime / el.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el || !src) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={toggle}
        disabled={!src}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow transition active:scale-95 disabled:opacity-40",
          compact ? "h-9 w-9" : "h-11 w-11"
        )}
      >
        {playing ? (
          <Pause className="h-5 w-5" fill="currentColor" />
        ) : (
          <Play className="h-5 w-5 translate-x-px" fill="currentColor" />
        )}
      </button>

      <div className="flex flex-1 items-center gap-[3px]" aria-hidden>
        {bars.map((h, i) => {
          const active = i / bars.length <= progress;
          return (
            <span
              key={i}
              className="w-[3px] shrink-0 rounded-full transition-colors"
              style={{
                height: `${Math.max(4, Math.min(1, h) * (compact ? 20 : 28))}px`,
                backgroundColor: active
                  ? "var(--color-primary)"
                  : "var(--border-light)",
              }}
            />
          );
        })}
      </div>

      {duration != null && (
        <span className="shrink-0 text-xs tabular-nums text-[var(--muted)]">
          {formatDuration(duration)}
        </span>
      )}

      {src && <audio ref={audioRef} src={src} preload="none" />}
    </div>
  );
}
