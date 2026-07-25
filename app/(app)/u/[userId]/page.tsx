"use client";

/** Built by Agent 13 — other-user profile: header, follow/unfollow, mutuals, Clips/Badges tabs. */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UserX } from "lucide-react";
import { AppHeader, EmptyState, SegmentedTabs } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId, useProfile } from "@/lib/query/hooks";
import { createOrGetDm } from "@/lib/api/chat";
import { ProfileHeader } from "./ProfileHeader";
import { ClipsTab } from "./ClipsTab";
import { BadgesTab } from "./BadgesTab";
import { useFollowState, useToggleFollow } from "./hooks";

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const viewerId = useCurrentUserId();
  const router = useRouter();
  const [tab, setTab] = useState<"clips" | "badges">("clips");

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useProfile(userId);
  const followState = useFollowState(userId, viewerId);
  const toggleFollow = useToggleFollow(userId ?? "", viewerId);

  const isOwnProfile = !!viewerId && !!userId && viewerId === userId;

  if (!userId) return null;

  if (profileError) {
    return (
      <>
        <AppHeader title="Profile" />
        <PageContainer size="md">
          <EmptyState
            icon={<UserX className="h-7 w-7" />}
            title="User not found"
            message="This profile may have been removed or is unavailable."
          />
        </PageContainer>
      </>
    );
  }

  const handleToggleFollow = () => {
    if (!viewerId) {
      toast.error("Sign in to follow users");
      return;
    }
    toggleFollow.mutate(!(followState.data?.isFollowing ?? false));
  };

  /** Opens (or creates) the DM with this user via the shared `create_or_get_dm` RPC. */
  const handleMessage = async () => {
    if (!userId) return;
    try {
      const conversationId = await createOrGetDm(userId);
      router.push(`/chat/${conversationId}`);
    } catch (err) {
      console.error("[profile] could not open DM", err);
      toast.error("Couldn't open that conversation");
    }
  };

  return (
    <>
      <AppHeader
        title={profile?.username ? `@${profile.username}` : "Profile"}
      />
      <PageContainer size="md">
        <ProfileHeader
          profile={profile}
          loading={profileLoading}
          isOwnProfile={isOwnProfile}
          followState={followState.data}
          followLoading={followState.isLoading}
          toggling={toggleFollow.isPending}
          onToggleFollow={handleToggleFollow}
          onMessage={handleMessage}
        />

        <SegmentedTabs
          className="mt-6"
          tabs={[
            { key: "clips", label: "Clips" },
            { key: "badges", label: "Badges" },
          ]}
          value={tab}
          onChange={(k) => setTab(k as "clips" | "badges")}
        />

        <div className="mt-4 pb-8">
          {tab === "clips" ? (
            <ClipsTab userId={userId} />
          ) : (
            <BadgesTab userId={userId} />
          )}
        </div>
      </PageContainer>
    </>
  );
}
