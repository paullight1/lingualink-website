"use client";

/**
 * Owner: Agent 12 — own profile: header (avatar/name/@handle/bio + follower/
 * following/clips stats), an Edit Profile modal (name/bio/avatar upload), and
 * My Clips / Badges / Rewards tabs backed by Supabase + the badges/monetization
 * API wrappers. Ported from mobile src/screens/ProfileScreen.tsx.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, Trophy, Wallet } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppHeader, SegmentedTabs, Skeleton } from "@/components/ui";
import { useCurrentUserId, useMyProfile } from "@/lib/query/hooks";
import { supabase } from "@/lib/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { EditProfileModal } from "./EditProfileModal";
import { ClipsTab } from "./ClipsTab";
import { BadgesTab } from "./BadgesTab";
import { RewardsTab } from "./RewardsTab";

async function fetchFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),
    supabase
      .from("followers")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);
  if (followers.error) throw followers.error;
  if (following.error) throw following.error;
  return { followerCount: followers.count ?? 0, followingCount: following.count ?? 0 };
}

async function fetchClipsCount(userId: string) {
  const [voice, video] = await Promise.all([
    supabase.from("voice_clips").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("video_clips").select("*", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  if (voice.error) throw voice.error;
  if (video.error) throw video.error;
  return (voice.count ?? 0) + (video.count ?? 0);
}

const TABS = [
  { key: "clips", label: "My Clips", icon: <Mic className="h-4 w-4" /> },
  { key: "badges", label: "Badges", icon: <Trophy className="h-4 w-4" /> },
  { key: "rewards", label: "Rewards", icon: <Wallet className="h-4 w-4" /> },
];

export default function ProfilePage() {
  const userId = useCurrentUserId();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const [tab, setTab] = useState<string>("clips");
  const [editOpen, setEditOpen] = useState(false);

  const { data: counts } = useQuery({
    queryKey: ["profile-counts", userId],
    queryFn: async () => {
      const [follow, clipsCount] = await Promise.all([
        fetchFollowCounts(userId as string),
        fetchClipsCount(userId as string),
      ]);
      return { ...follow, clipsCount };
    },
    enabled: !!userId,
  });

  return (
    <>
      <AppHeader title="My Profile" />
      <PageContainer size="md">
        <div className="flex flex-col gap-6">
          {profileLoading ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-[88px] w-[88px] rounded-full" />
                <div className="flex-1">
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-14 w-full rounded-[16px]" />
            </div>
          ) : (
            <ProfileHeader
              profile={profile}
              followerCount={counts?.followerCount ?? 0}
              followingCount={counts?.followingCount ?? 0}
              clipsCount={counts?.clipsCount ?? 0}
              onEdit={() => setEditOpen(true)}
            />
          )}

          <div>
            <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
            <div className="pt-4">
              {tab === "clips" && userId && <ClipsTab userId={userId} />}
              {tab === "badges" && <BadgesTab />}
              {tab === "rewards" && userId && <RewardsTab userId={userId} />}
            </div>
          </div>
        </div>
      </PageContainer>

      {userId && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profile}
          userId={userId}
        />
      )}
    </>
  );
}
