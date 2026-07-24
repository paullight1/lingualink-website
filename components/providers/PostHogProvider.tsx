"use client";

import { useEffect, type ReactNode } from "react";
import posthog from "posthog-js";

/**
 * Initializes PostHog analytics if a key is configured. No-op otherwise, so
 * the app runs fine without analytics credentials.
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || typeof window === "undefined") return;
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
      person_profiles: "identified_only",
    });
  }, []);

  return <>{children}</>;
}

/** Thin analytics wrapper — mirrors mobile src/services/analytics.ts. */
export const analytics = {
  track(event: string, props?: Record<string, unknown>) {
    try {
      posthog.capture(event, props);
    } catch {
      /* noop */
    }
  },
  identify(id: string, props?: Record<string, unknown>) {
    try {
      posthog.identify(id, props);
    } catch {
      /* noop */
    }
  },
  reset() {
    try {
      posthog.reset();
    } catch {
      /* noop */
    }
  },
};
