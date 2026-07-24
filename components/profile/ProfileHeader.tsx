"use client";

import { Camera, Pencil } from "lucide-react";
import { UserAvatar, StatRow, PrimaryButton } from "@/components/ui";
import type { ProfileRow } from "@/lib/types";

/** Own-profile header: avatar (+ edit badge), name/@handle, bio, stat row, Edit Profile CTA. */
export function ProfileHeader({
  profile,
  followerCount,
  followingCount,
  clipsCount,
  onEdit,
}: {
  profile?: ProfileRow | null;
  followerCount: number;
  followingCount: number;
  clipsCount: number;
  onEdit: () => void;
}) {
  const name = profile?.full_name || "User";
  const handle = profile?.username || "user";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <UserAvatar uri={profile?.avatar_url} name={name} size={88} ring />
          <button
            onClick={onEdit}
            aria-label="Edit avatar"
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow ring-2 ring-[var(--background)]"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h1 className="truncate text-xl font-extrabold tracking-tight text-[var(--foreground)]">
            {name}
          </h1>
          <p className="truncate text-sm font-medium text-[var(--color-primary)]">
            @{handle}
          </p>
          {profile?.bio && (
            <p className="mt-1.5 line-clamp-2 text-sm text-[var(--muted)]">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      <StatRow
        stats={[
          { label: "Followers", value: followerCount },
          { label: "Following", value: followingCount },
          { label: "Clips", value: clipsCount },
        ]}
        className="rounded-[16px] border border-[var(--border-light)] bg-[var(--surface)] py-3"
      />

      <PrimaryButton
        variant="secondary"
        size="md"
        leftIcon={<Pencil className="h-4 w-4" />}
        onClick={onEdit}
      >
        Edit Profile
      </PrimaryButton>
    </div>
  );
}
