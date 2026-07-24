"use client";

/** Owner: Agent (sign-up). Colocated helper — completes the Google OAuth redirect
 *  started from the sign-up page's `authenticateWithRedirect` call. */

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SignUpSsoCallbackPage() {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      <p className="text-sm text-[var(--muted)]">Finishing sign-up...</p>
      <AuthenticateWithRedirectCallback signUpForceRedirectUrl="/onboarding" />
    </div>
  );
}
