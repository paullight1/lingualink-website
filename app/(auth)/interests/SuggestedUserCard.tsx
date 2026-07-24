"use client";

import { UserAvatar, PrimaryButton } from "@/components/ui";
import type { SuggestedUser } from "./useSuggestedUsers";

/** One suggested-follow row — avatar, name, handle, shared interests, follow toggle. */
export function SuggestedUserCard({
  user,
  onToggleFollow,
}: {
  user: SuggestedUser;
  onToggleFollow: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
      <UserAvatar uri={user.avatar_url} name={user.full_name || user.username} size={56} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[var(--foreground)]">
          {user.full_name}
        </p>
        <p className="truncate text-sm text-[var(--muted)]">@{user.username}</p>
        {user.common_interests.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {user.common_interests.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-[var(--input)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <PrimaryButton
        type="button"
        size="sm"
        fullWidth={false}
        variant={user.is_following ? "secondary" : "primary"}
        className="shrink-0"
        onClick={onToggleFollow}
      >
        {user.is_following ? "Following" : "Follow"}
      </PrimaryButton>
    </div>
  );
}
