"use client";

import Link from "next/link";
import { BadgeCheck, MessageCircle, UserPlus, UserCheck } from "lucide-react";
import { GlassCard, PrimaryButton, StatRow, UserAvatar, Skeleton } from "@/components/ui";
import type { ProfileRow } from "@/lib/types";
import type { FollowState } from "./hooks";

/** Header for the other-user profile: avatar, identity, stats, follow/message CTAs. */
export function ProfileHeader({
  profile,
  loading,
  isOwnProfile,
  followState,
  followLoading,
  toggling,
  onToggleFollow,
  onMessage,
}: {
  profile: ProfileRow | null | undefined;
  loading: boolean;
  isOwnProfile: boolean;
  followState: FollowState | undefined;
  followLoading: boolean;
  toggling: boolean;
  onToggleFollow: () => void;
  onMessage: () => void;
}) {
  if (loading) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <div className="mt-5 flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
      </GlassCard>
    );
  }

  const isFollowing = followState?.isFollowing ?? false;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-4">
        <UserAvatar
          uri={profile?.avatar_url}
          name={profile?.full_name || profile?.username}
          size={80}
          ring
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-xl font-bold text-[var(--foreground)]">
              {profile?.full_name || "User"}
            </h1>
            {/* "Verified" comes from having verified dialects — there is no
                boolean `is_verified` column on `profiles`. */}
            {(profile?.verified_dialects?.length ?? 0) > 0 && (
              <BadgeCheck className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
            )}
          </div>
          <p className="truncate text-sm font-medium text-[var(--color-primary)]">
            @{profile?.username || "user"}
          </p>
        </div>
      </div>

      {!!profile?.bio && (
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {profile.bio}
        </p>
      )}

      <StatRow
        className="mt-5"
        stats={[
          { label: "Followers", value: followState?.followerCount ?? 0 },
          { label: "Following", value: followState?.followingCount ?? 0 },
          { label: "Mutual", value: followState?.mutualCount ?? 0 },
        ]}
      />

      <div className="mt-5 flex gap-3">
        {isOwnProfile ? (
          <Link href="/profile" className="flex-1">
            <PrimaryButton variant="secondary">Edit Profile</PrimaryButton>
          </Link>
        ) : (
          <>
            <PrimaryButton
              variant={isFollowing ? "outline" : "primary"}
              loading={followLoading || toggling}
              leftIcon={
                !followLoading && !toggling ? (
                  isFollowing ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )
                ) : undefined
              }
              onClick={onToggleFollow}
            >
              {isFollowing ? "Following" : "Follow"}
            </PrimaryButton>
            <PrimaryButton
              variant="secondary"
              leftIcon={<MessageCircle className="h-4 w-4" />}
              onClick={onMessage}
            >
              Message
            </PrimaryButton>
          </>
        )}
      </div>
    </GlassCard>
  );
}
