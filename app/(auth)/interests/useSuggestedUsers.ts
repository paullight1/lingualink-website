"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { qk } from "@/lib/query/keys";

export interface SuggestedUser {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  common_interests: string[];
  /** initial follow state, seeded from any existing `followers` row */
  is_following: boolean;
}

async function fetchSuggestedUsers(userId: string): Promise<SuggestedUser[]> {
  const [{ data: profiles, error: profilesError }, { data: following, error: followError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, interests")
        .neq("id", userId)
        .limit(50),
      supabase.from("followers").select("following_id").eq("follower_id", userId),
    ]);

  if (profilesError) throw profilesError;
  if (followError) throw followError;

  const followingIds = new Set((following ?? []).map((f) => f.following_id as string));

  // Shuffle then take 10 suggestions, mirroring the mobile screen.
  const shuffled = [...(profiles ?? [])].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, 10).map((p) => ({
    id: p.id as string,
    full_name: (p.full_name as string) || "Anonymous",
    username: (p.username as string) || "user",
    avatar_url: (p.avatar_url as string) ?? null,
    common_interests: ((p.interests as string[]) ?? []).slice(0, 3),
    is_following: followingIds.has(p.id as string),
  }));
}

/** Suggested users to follow, fetched lazily once the user reaches step 2. */
export function useSuggestedUsers(userId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: qk.suggestedUsers(),
    enabled: enabled && !!userId,
    queryFn: () => fetchSuggestedUsers(userId as string),
    staleTime: 60_000,
  });
}
