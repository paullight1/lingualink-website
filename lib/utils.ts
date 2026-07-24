import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "3h ago" style relative time from an ISO string. */
export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.34524, "w"],
    [12, "mo"],
    [Number.POSITIVE_INFINITY, "y"],
  ];
  let val = secs;
  let unit = "s";
  for (const [size, label] of units) {
    if (val < size) {
      unit = label;
      break;
    }
    val = Math.floor(val / size);
    unit = label;
  }
  return `${val}${unit} ago`;
}

/** Initials for avatar fallbacks. */
export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Format a USD amount. */
export function formatUsd(amount?: number | null): string {
  return `$${(amount ?? 0).toFixed(2)}`;
}

/** Format seconds as m:ss. */
export function formatDuration(seconds?: number | null): string {
  const s = Math.max(0, Math.floor(seconds ?? 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Normalize a handle: lowercase, strip invalid chars. */
export function normalizeUsername(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
}

/** Deterministic pseudo-waveform for clips lacking real amplitude data. */
export function fallbackWaveform(seed: string, bars = 24): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: bars }, (_, i) => {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    return 0.25 + ((h >> (i % 15)) % 100) / 133;
  });
}
