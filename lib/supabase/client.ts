import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

/*
 * Browser Supabase client — ported from the mobile app's src/supabaseClient.ts.
 * Clerk owns the session; the Clerk `supabase`-template JWT is attached to each
 * request so Postgres RLS sees the user.
 *
 * The token is resolved per-request via supabase-js's `accessToken` callback
 * rather than being pushed in ahead of time. That ordering matters: React runs
 * a parent's effects *after* its children's, so a provider that injected the
 * token from its own effect always lost the race against the first wave of
 * child queries — those ran as anon, and RPCs that check `auth.uid()` failed
 * with "Not authenticated". Pulling the token at request time removes the race
 * and keeps it fresh without a refresh interval.
 */

/* Missing-env checking lives in lib/config.ts, which throws by variable name
 * before this module ever reaches createClient. */

/** Registered by SupabaseTokenBridge; null while signed out. */
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setSupabaseTokenGetter(
  getter: (() => Promise<string | null>) | null
) {
  tokenGetter = getter;
}

/** Latest Clerk JWT, or null when signed out. Safe to call before sign-in. */
export async function getSupabaseToken(): Promise<string | null> {
  if (!tokenGetter) return null;
  try {
    return await tokenGetter();
  } catch (err) {
    console.warn("[Supabase] token fetch failed", err);
    return null;
  }
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    // Clerk is the session authority — don't let supabase-js manage one.
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "lingualink-web" } },
    accessToken: () => getSupabaseToken(),
  }
);

export const hasAuthToken = (): boolean => tokenGetter !== null;
