"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { qk } from "@/lib/query/keys";
import { normalizeUsername } from "@/lib/utils";

/** Colocated data hooks for the Settings page (referrals, languages, notification prefs). */

// `useLanguages` / `LanguageOption` moved to the shared query layer so the
// recorders use the same list; re-exported here to keep existing imports valid.
export { useLanguages, type LanguageOption } from "@/lib/query/hooks";

export interface ReferralInfo {
  code: string;
  inviteCount: number;
}

async function fetchReferralInfo(userId: string, username: string | null): Promise<ReferralInfo> {
  // Referral code mirrors the mobile app: "@{username}" — there's no dedicated
  // code column on referral_codes, it's derived from the profile username.
  const code = `@${normalizeUsername(username || "user") || "user"}`;

  const { data: codeRow } = await supabase
    .from("referral_codes")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!codeRow?.id) return { code, inviteCount: 0 };

  const { data: rows, error } = await supabase
    .from("referrals")
    .select("id")
    .eq("referral_code_id", codeRow.id);
  if (error) throw error;

  return { code, inviteCount: rows?.length ?? 0 };
}

/** The signed-in user's referral code + how many people joined with it. */
export function useReferralInfo(userId: string | null, username: string | null | undefined) {
  return useQuery({
    queryKey: ["settings", "referral", userId],
    enabled: !!userId,
    queryFn: () => fetchReferralInfo(userId as string, username ?? null),
  });
}

export interface NotificationPrefs {
  likes: boolean;
  duets: boolean;
  validations: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  likes: true,
  duets: true,
  validations: false,
};

const PREFS_KEY = "lingualink-notification-prefs";

/** Notification toggle prefs, persisted to localStorage (per FOUNDATION brief). */
export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
    } catch {
      // ignore malformed storage
    }
  }, []);

  const update = useCallback((key: keyof NotificationPrefs, value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {
        // ignore quota/availability errors
      }
      return next;
    });
  }, []);

  return { prefs, update };
}
