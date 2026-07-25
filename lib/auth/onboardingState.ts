import type { ProfileRow } from "@/lib/types";

/**
 * Where a signed-in user belongs in the sign-up funnel.
 *
 * `has_completed_onboarding` was being written by the interests step and read
 * by nothing, so the flag had no effect: anyone who arrived at /feed without
 * finishing setup — most importantly a first-time Google user, who skips the
 * email/password funnel entirely — landed on a feed backed by a `profiles` row
 * that did not exist yet. This is the single place that decides.
 */
export type OnboardingStage = "profile-setup" | "interests" | "complete";

export const STAGE_ROUTE: Record<
  Exclude<OnboardingStage, "complete">,
  string
> = {
  "profile-setup": "/profile-setup",
  interests: "/interests",
};

/**
 * A profile is only past `profile-setup` once it carries the fields that step
 * is responsible for. Checking the columns rather than trusting a single flag
 * means a row half-written by an interrupted setup is still routed correctly.
 */
export function onboardingStage(
  profile: ProfileRow | null | undefined
): OnboardingStage {
  if (!profile) return "profile-setup";

  const hasIdentity = Boolean(profile.username && profile.country);
  if (!hasIdentity) return "profile-setup";

  if (!profile.has_completed_onboarding) return "interests";

  return "complete";
}
