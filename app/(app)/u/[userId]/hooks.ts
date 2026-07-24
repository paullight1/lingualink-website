"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { badgesApi } from "@/lib/api/badges";
import { qk } from "@/lib/query/keys";
import type { VoiceClipRow, VideoClipRow } from "@/lib/types";

/**
 * Colocated data hooks for the other-user profile page. Kept out of the
 * shared `lib/query/hooks.ts` so this route stays self-contained.
 */

export type UserClipItem =
  | ({ kind: "voice" } & VoiceClipRow)
  | ({ kind: "video" } & VideoClipRow);

export interface FollowState {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  mutualCount: number;
}

async function fetchFollowState(
  targetUserId: string,
  viewerId: string | null
): Promise<FollowState> {
  const [{ count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId),
      supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", targetUserId),
    ]);

  let isFollowing = false;
  let mutualCount = 0;

  if (viewerId && viewerId !== targetUserId) {
    const [{ data: followRow }, { data: targetFollowers }, { data: viewerFollowing }] =
      await Promise.all([
        supabase
          .from("followers")
          .select("id")
          .eq("follower_id", viewerId)
          .eq("following_id", targetUserId)
          .maybeSingle(),
        supabase
          .from("followers")
          .select("follower_id")
          .eq("following_id", targetUserId)
          .limit(2000),
        supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", viewerId)
          .limit(2000),
      ]);

    isFollowing = !!followRow;
    const viewerFollowingSet = new Set<string>(
      (viewerFollowing ?? []).map((r: { following_id: string }) => r.following_id)
    );
    mutualCount = (targetFollowers ?? []).filter((r: { follower_id: string }) =>
      viewerFollowingSet.has(r.follower_id)
    ).length;
  }

  return {
    isFollowing,
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
    mutualCount,
  };
}

/** Follow status + follower/following/mutual counts for a profile, from the viewer's perspective. */
export function useFollowState(
  targetUserId: string | undefined,
  viewerId: string | null
) {
  return useQuery({
    queryKey: targetUserId ? qk.followState(targetUserId) : ["follow-state", "none"],
    enabled: !!targetUserId,
    queryFn: () => fetchFollowState(targetUserId as string, viewerId),
  });
}

/** Optimistic follow/unfollow mutation against the `followers` table. */
export function useToggleFollow(targetUserId: string, viewerId: string | null) {
  const client = useQueryClient();
  const key = qk.followState(targetUserId);

  return useMutation({
    mutationFn: async (nextFollowing: boolean) => {
      if (!viewerId) throw new Error("Sign in to follow users");
      if (nextFollowing) {
        const { error } = await supabase
          .from("followers")
          .insert({ follower_id: viewerId, following_id: targetUserId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("followers")
          .delete()
          .eq("follower_id", viewerId)
          .eq("following_id", targetUserId);
        if (error) throw error;
      }
    },
    onMutate: async (nextFollowing) => {
      await client.cancelQueries({ queryKey: key });
      const prev = client.getQueryData<FollowState>(key);
      if (prev) {
        client.setQueryData<FollowState>(key, {
          ...prev,
          isFollowing: nextFollowing,
          followerCount: Math.max(0, prev.followerCount + (nextFollowing ? 1 : -1)),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) client.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: key });
    },
  });
}

async function fetchUserClips(userId: string): Promise<UserClipItem[]> {
  const [{ data: voice, error: vErr }, { data: video, error: vidErr }] =
    await Promise.all([
      supabase
        .from("voice_clips")
        .select(
          "id,user_id,phrase,translation,language,dialect,audio_url,duration,created_at,likes_count,comments_count,validations_count,is_validated"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("video_clips")
        .select(
          "id,user_id,phrase,caption,translation,language,video_url,thumbnail_url,duration,created_at,likes_count,comments_count"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

  if (vErr) throw vErr;
  if (vidErr) throw vidErr;

  const items: UserClipItem[] = [
    ...(voice ?? []).map((c: VoiceClipRow) => ({ kind: "voice" as const, ...c })),
    ...(video ?? []).map((c: VideoClipRow) => ({ kind: "video" as const, ...c })),
  ];

  return items.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/** Combined voice + video clips for a user's profile "Clips" tab. */
export function useUserClips(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? (["user-clips", userId] as const) : (["user-clips", "none"] as const),
    enabled: !!userId,
    queryFn: () => fetchUserClips(userId as string),
  });
}

/** Earned badges for a user's profile "Badges" tab. */
export function useUserBadgesTab(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? qk.badges(userId) : (["badges", "none"] as const),
    enabled: !!userId,
    queryFn: () => badgesApi.getUserBadges(userId as string),
  });
}
