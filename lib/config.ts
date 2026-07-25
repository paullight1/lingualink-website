/**
 * Centralized configuration. Reads NEXT_PUBLIC_* env vars (browser-safe).
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://lingualink-backend-otu6.onrender.com/api/v1";

/*
 * NEXT_PUBLIC_* values are inlined at build time, so a missing one can't be
 * recovered at runtime — the deployed bundle would carry `undefined` forever.
 * Fail here, loudly and by name, rather than letting supabase-js crash a
 * prerender worker with the unattributable "supabaseUrl is required."
 */
const SUPABASE_URL_RAW = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY_RAW = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const missingSupabaseEnv = [
  !SUPABASE_URL_RAW && "NEXT_PUBLIC_SUPABASE_URL",
  !SUPABASE_ANON_KEY_RAW && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
].filter(Boolean);

if (missingSupabaseEnv.length > 0) {
  throw new Error(
    `[LinguaLink] Missing required environment ${
      missingSupabaseEnv.length > 1 ? "variables" : "variable"
    }: ${missingSupabaseEnv.join(", ")}.\n` +
      "These are read at build time, so they must be set in the build " +
      "environment (Vercel → Settings → Environment Variables), not just in " +
      "a local .env.local. See .env.local.example for the full list."
  );
}

export const SUPABASE_URL = SUPABASE_URL_RAW as string;
export const SUPABASE_ANON_KEY = SUPABASE_ANON_KEY_RAW as string;

export const APP_NAME = "LinguaLink";
export const APP_VERSION = "1.0.0";

/** Clerk JWT template that both Supabase (RLS) and the NestJS API validate. */
export const CLERK_SUPABASE_TEMPLATE = "supabase";

export const DEFAULT_AVATAR =
  "https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-image-182145777.jpg";

/** Storage buckets (mirrors mobile app). */
export const BUCKETS = {
  voiceClips: "voice-clips",
  videos: "videos",
  stories: "stories",
  avatars: "avatars",
  voiceMessages: "voice-messages",
} as const;
