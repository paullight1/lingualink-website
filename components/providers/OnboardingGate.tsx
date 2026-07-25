"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Spinner } from "@/components/ui";
import { useMyProfile } from "@/lib/query/hooks";
import { onboardingStage, STAGE_ROUTE } from "@/lib/auth/onboardingState";

/**
 * Keeps half-onboarded users out of the authenticated app.
 *
 * Scope: `middleware.ts` decides whether you are *signed in*; this decides
 * whether you are *set up*. Onboarding completeness is not a security
 * boundary — every table is behind RLS keyed on `auth.uid()` regardless — so
 * running it on the client is enough, and it avoids a per-navigation Supabase
 * round trip in edge middleware.
 *
 * The profile query is shared (TanStack `qk.myProfile()`), so pages inside the
 * gate reuse this fetch rather than issuing their own.
 */
export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: profile, isPending, isError } = useMyProfile();

  const signedIn = isLoaded && isSignedIn;
  // While the profile is still loading, `stage` is meaningless — `waiting`
  // below is what gates on it.
  const stage = onboardingStage(profile);
  const waiting = !isLoaded || (signedIn && isPending);

  // A failed profile fetch (offline, RLS hiccup) must not bounce anyone into
  // onboarding — that would strand a fully set-up user in a redirect they
  // cannot escape. Fail open and let the page render its own error state.
  const shouldRedirect =
    signedIn && !waiting && !isError && stage !== "complete";

  useEffect(() => {
    if (shouldRedirect) {
      router.replace(STAGE_ROUTE[stage as keyof typeof STAGE_ROUTE]);
    }
  }, [shouldRedirect, stage, router]);

  if (waiting || shouldRedirect) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
