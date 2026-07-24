import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

/*
 * Browser Supabase client — ported from the mobile app's src/supabaseClient.ts.
 * Clerk owns the session; we inject the Clerk `supabase`-template JWT into the
 * Authorization header so Postgres RLS sees the user. `setSupabaseToken` is
 * called by the SupabaseTokenBridge client component on the Clerk token cycle.
 */

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Surfaces a clear error instead of a cryptic network failure.
  console.error(
    "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

let currentClerkToken: string | null = null;
let authenticatedClient: SupabaseClient | null = null;

const baseSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { headers: { "X-Client-Info": "lingualink-web" } },
});

export const setSupabaseToken = (token: string | null) => {
  currentClerkToken = token;
  if (token) {
    authenticatedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          "X-Client-Info": "lingualink-web",
          Authorization: `Bearer ${token}`,
        },
      },
    });
  } else {
    authenticatedClient = null;
  }
};

/** Proxy that routes to the authenticated client when a token is present. */
const supabaseProxy = new Proxy(baseSupabase, {
  get(target, prop, receiver) {
    const client = authenticatedClient || target;
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const supabase = supabaseProxy as SupabaseClient;

export const hasAuthToken = (): boolean => currentClerkToken !== null;
export const getSupabaseToken = (): string | null => currentClerkToken;
export const getAuthenticatedSupabase = (): SupabaseClient =>
  authenticatedClient || baseSupabase;
