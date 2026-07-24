/**
 * Recording container/codec selection.
 *
 * The web app writes into the SAME `voice_clips` / `video_clips` tables the
 * Expo app reads from, so a clip recorded in a browser has to be playable by
 * the mobile app too. MediaRecorder's default is WebM/Opus, which iOS (Safari
 * and the React Native player) cannot decode at all — those clips would look
 * fine on web and be silent dead rows on iPhone.
 *
 * So we prefer MP4/AAC (what the mobile app itself records) and only fall back
 * to WebM when the browser genuinely can't produce MP4. Chrome 130+, Safari and
 * recent Firefox all support MP4 capture; older Chrome/Firefox get WebM.
 */

/** Preference order, most portable first. */
const AUDIO_CANDIDATES = [
  'audio/mp4;codecs="mp4a.40.2"', // AAC-LC in MP4 — what mobile records
  "audio/mp4",
  "audio/aac",
  "audio/webm;codecs=opus",
  "audio/webm",
] as const;

const VIDEO_CANDIDATES = [
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', // H.264 baseline + AAC
  "video/mp4",
  "video/webm;codecs=vp8,opus",
  "video/webm",
] as const;

function firstSupported(candidates: readonly string[]): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return candidates.find((type) => {
    try {
      return MediaRecorder.isTypeSupported(type);
    } catch {
      return false;
    }
  });
}

/** Best available audio recording mime type, or undefined to use the browser default. */
export function pickAudioMimeType(): string | undefined {
  return firstSupported(AUDIO_CANDIDATES);
}

/** Best available video recording mime type, or undefined to use the browser default. */
export function pickVideoMimeType(): string | undefined {
  return firstSupported(VIDEO_CANDIDATES);
}

/** True when the chosen mime type produces a file the mobile app can play. */
export function isMobileCompatible(mimeType: string | undefined | null): boolean {
  return !!mimeType && /mp4|aac|mpeg/i.test(mimeType);
}

/**
 * File extension for a recorded blob's mime type. Storage keys and the
 * `audio_url` / `video_url` columns are shared with mobile, which sniffs the
 * extension, so this has to reflect the real container.
 */
export function extensionForMime(mimeType: string | undefined | null): string {
  if (!mimeType) return "webm";
  const base = mimeType.split(";")[0].trim().toLowerCase();
  switch (base) {
    case "audio/mp4":
      return "m4a";
    case "audio/aac":
      return "aac";
    case "audio/mpeg":
      return "mp3";
    case "video/mp4":
      return "mp4";
    case "audio/ogg":
      return "ogg";
    case "video/webm":
    case "audio/webm":
      return "webm";
    default:
      return base.startsWith("video/") ? "mp4" : "m4a";
  }
}
