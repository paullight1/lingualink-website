"use client";

import { useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setSupabaseTokenGetter } from "@/lib/supabase/client";
import { markAuthSettled, setAuthTokenProvider } from "@/lib/api/authFetch";
import { CLERK_SUPABASE_TEMPLATE } from "@/lib/config";

/**
 * Bridges Clerk auth into the Supabase client and the NestJS authFetch client.
 *
 * Registration happens during render, not in an effect. React runs a parent's
 * effects *after* its children's, so registering from an effect here meant the
 * first queries on every page ran before a token existed — Supabase RPCs that
 * check `auth.uid()` failed with "Not authenticated" and authFetch threw
 * "Authentication required" on a valid session. Both consumers pull the token
 * lazily per request, so handing them the getter early is enough; no interval
 * refresh is needed.
 */
export function SupabaseTokenBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();

  const getSupabaseToken = useCallback(
    () => getToken({ template: CLERK_SUPABASE_TEMPLATE }),
    [getToken]
  );

  // Idempotent module-level registration — safe to repeat on every render.
  const provider = isLoaded && isSignedIn ? getSupabaseToken : null;
  setSupabaseTokenGetter(provider);
  setAuthTokenProvider(provider, userId ?? null);

  // Release any requests waiting on auth once Clerk has resolved, signed in or not.
  useEffect(() => {
    if (isLoaded) markAuthSettled();
  }, [isLoaded]);

  return <>{children}</>;
}
