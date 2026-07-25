import { authFetch } from "./authFetch";

/**
 * Referral attribution — web port of the mobile AuthProvider's redemption loop.
 *
 * The code is captured on the sign-up form but can't be redeemed there: the
 * request has to be authenticated, and at that moment the user has no session
 * yet. Mobile parks it in AsyncStorage and retries on the next authenticated
 * launch; this is the same thing over localStorage.
 *
 * Redemption is idempotent server-side (attribution applies at most once), so
 * running it again after the Clerk signup webhook already linked the user is
 * safe.
 */

const PENDING_REFERRAL_KEY = "pending_referral_code";

/**
 * Outcomes that will never succeed on retry. Anything else (notably
 * `referee_not_found`, which just means the profile hasn't synced yet) keeps
 * the code parked for the next attempt.
 */
const TERMINAL_REASONS = [
  "self_referral",
  "referrer_not_found",
  "already_attributed",
  "empty_code",
  "missing_input",
];

export interface ReferralResult {
  linked?: boolean;
  reason?: string;
  referrerId?: string;
}

/** Park a code captured at sign-up, before a session exists. */
export function storePendingReferral(code: string | undefined | null): void {
  const trimmed = (code ?? "").trim();
  if (trimmed.length < 3) return;
  try {
    localStorage.setItem(PENDING_REFERRAL_KEY, trimmed);
  } catch {
    // Private mode / storage disabled — the code is simply lost, which is no
    // worse than the previous behaviour of never sending it at all.
  }
}

export function readPendingReferral(): string | null {
  try {
    return localStorage.getItem(PENDING_REFERRAL_KEY);
  } catch {
    return null;
  }
}

function clearPendingReferral(): void {
  try {
    localStorage.removeItem(PENDING_REFERRAL_KEY);
  } catch {
    /* nothing to do */
  }
}

/**
 * Redeem any parked code. Safe to call on every authenticated load — it's a
 * no-op when there's nothing parked.
 */
export async function redeemPendingReferral(): Promise<ReferralResult | null> {
  const code = readPendingReferral();
  if (!code) return null;

  try {
    const res = await authFetch("/ambassador/referral", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    const data = (await res.json().catch(() => ({}))) as ReferralResult;

    if (data?.linked || TERMINAL_REASONS.includes(data?.reason ?? "")) {
      clearPendingReferral();
    }
    return data;
  } catch (err) {
    // Transient failure — leave the code parked and retry next time.
    console.warn("[referral] redemption failed", err);
    return null;
  }
}
