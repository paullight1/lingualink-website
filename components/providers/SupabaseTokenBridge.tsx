"use client";

import { useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setSupabaseTokenGetter } from "@/lib/supabase/client";
import { markAuthSettled, setAuthTokenProvider } from "@/lib/api/authFetch";
import { redeemPendingReferral } from "@/lib/api/referral";
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

  // Redeem a referral code captured at sign-up. It can't be sent from the
  // sign-up form (no session yet), so it is parked in localStorage and
  // retried here on each authenticated load until it links or the backend
  // reports a terminal outcome — same contract as the mobile AuthProvider.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    void redeemPendingReferral();
  }, [isLoaded, isSignedIn, userId]);

  return <>{children}</>;
}
