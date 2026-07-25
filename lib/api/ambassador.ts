import { authFetch, parseResponse } from "./authFetch";

/**
 * Ambassador programme. Wraps the same NestJS `/ambassador/*` endpoints the
 * mobile AmbassadorScreen calls.
 */

export type ApplicationStatus = "none" | "pending" | "approved" | "rejected";

export interface AmbassadorStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  monthlyStipend: number;
  rank?: number;
}

export interface AmbassadorLeaderboardEntry {
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  referrals: number;
  region?: string | null;
}

export async function getApplicationStatus(): Promise<ApplicationStatus> {
  try {
    const data = await parseResponse<{ application?: { status: ApplicationStatus } }>(
      await authFetch("/ambassador/application-status")
    );
    return data.application?.status ?? "none";
  } catch (err) {
    console.error("[ambassador] status check failed", err);
    return "none";
  }
}

export async function getStats(): Promise<AmbassadorStats | null> {
  try {
    const data = await parseResponse<{ stats: AmbassadorStats }>(
      await authFetch("/ambassador/stats")
    );
    return data.stats ?? null;
  } catch (err) {
    console.error("[ambassador] stats fetch failed", err);
    return null;
  }
}

export async function getLeaderboard(): Promise<AmbassadorLeaderboardEntry[]> {
  try {
    const data = await parseResponse<{
      leaderboard: AmbassadorLeaderboardEntry[];
    }>(await authFetch("/ambassador/leaderboard"));
    return data.leaderboard ?? [];
  } catch (err) {
    console.error("[ambassador] leaderboard fetch failed", err);
    return [];
  }
}

export async function applyForAmbassador(input: {
  region: string;
  motivation: string;
  experienceDetails?: string;
}): Promise<void> {
  const response = await authFetch("/ambassador/apply", {
    method: "POST",
    body: JSON.stringify({
      region: input.region,
      motivation: input.motivation,
      experienceDetails: input.experienceDetails,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Failed to submit application");
  }
}

/** The referral code is just the handle, always @-prefixed (same as mobile). */
export function referralCodeFor(username: string | null | undefined): string {
  const handle = (username || "user").replace(/^@+/, "");
  return `@${handle}`;
}

export function inviteMessage(code: string): string {
  return `Join LinguaLink with my code ${code} and we both earn rewards!\n\nDownload now: https://lingualink.ai`;
}
