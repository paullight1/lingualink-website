"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setSupabaseToken } from "@/lib/supabase/client";
import { setAuthTokenProvider } from "@/lib/api/authFetch";
import { CLERK_SUPABASE_TEMPLATE } from "@/lib/config";

/**
 * Bridges Clerk auth into the Supabase client and the NestJS authFetch client.
 * Ports the mobile AuthProvider token cycle: it registers a token getter and
 * refreshes the injected Supabase JWT on an interval (Clerk owns the session).
 */
export function SupabaseTokenBridge({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const getSupabaseToken = () =>
      getToken({ template: CLERK_SUPABASE_TEMPLATE });

    // Register the getter used by authFetch for NestJS calls.
    setAuthTokenProvider(getSupabaseToken, userId ?? null);

    if (!isSignedIn) {
      setSupabaseToken(null);
      return;
    }

    let cancelled = false;
    const refresh = async () => {
      try {
        const token = await getSupabaseToken();
        if (!cancelled) setSupabaseToken(token);
      } catch (e) {
        console.warn("[TokenBridge] failed to refresh Supabase token", e);
      }
    };

    refresh();
    // Clerk short-lived tokens ~60s; refresh comfortably inside that window.
    const interval = setInterval(refresh, 45_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoaded, isSignedIn, userId, getToken]);

  return <>{children}</>;
}
