"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase/client";
import { qk } from "./keys";
import type { ProfileRow } from "@/lib/types";

/**
 * Shared data hooks used across features. Feature agents may add their own
 * colocated hooks, but these cover the common profile/identity needs.
 */

/** Current Clerk user id (stable, from Clerk session). */
export function useCurrentUserId(): string | null {
  const { userId } = useAuth();
  return userId ?? null;
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ProfileRow) ?? null;
}

/** The signed-in user's profile row. */
export function useMyProfile() {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: qk.myProfile(),
    enabled: !!userId,
    queryFn: () => fetchProfile(userId as string),
  });
}

/** Any user's profile row by id. */
export function useProfile(userId?: string) {
  return useQuery({
    queryKey: userId ? qk.profile(userId) : ["profile", "none"],
    enabled: !!userId,
    queryFn: () => fetchProfile(userId as string),
  });
}

/** Invalidate the current user's profile after a mutation. */
export function useInvalidateMyProfile() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: qk.myProfile() });
}

export interface LanguageOption {
  id: string;
  name: string;
  dialect: string | null;
}

async function fetchLanguages(): Promise<LanguageOption[]> {
  const { data, error } = await supabase
    .from("languages")
    .select("id, name, dialect")
    .order("name", { ascending: true });
  if (error) throw error;

  // The table carries real duplicates — "Igbo" appears 18 times, "Nembe" 9,
  // and so on. Collapsing identical name+dialect pairs keeps every genuinely
  // distinct dialect while stopping pickers from listing the same option over
  // and over (and stopping React from warning about repeated keys).
  const seen = new Set<string>();
  const unique: LanguageOption[] = [];
  for (const row of (data as LanguageOption[]) ?? []) {
    const key = `${row.name.trim().toLowerCase()}|${(row.dialect ?? "").trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
  }
  return unique;
}

/**
 * Distinct language names, for pickers that store a bare name rather than a
 * language row (going live, starting a game room).
 */
export function uniqueLanguageNames(
  languages: LanguageOption[] | undefined
): string[] {
  const names = new Set((languages ?? []).map((l) => l.name.trim()).filter(Boolean));
  return names.size > 0 ? [...names].sort() : ["English"];
}

/**
 * Selectable languages from the shared `languages` table — the same source the
 * mobile LanguagePicker reads, so both clients offer identical options and
 * write matching `language` / `dialect` values onto clips.
 */
export function useLanguages() {
  return useQuery({
    queryKey: qk.languages(),
    queryFn: fetchLanguages,
    staleTime: 5 * 60_000,
  });
}
