"use client";

import { useState } from "react";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials as toInitials } from "@/lib/utils";

/**
 * Circular avatar with graceful fallback (initials, else a person icon).
 * Web port of the mobile UserAvatar.
 */
export interface UserAvatarProps {
  uri?: string | null;
  size?: number;
  name?: string | null;
  className?: string;
  ring?: boolean; // orange ring (e.g. live / stories)
}

export function UserAvatar({
  uri,
  size = 40,
  name,
  className,
  ring,
}: UserAvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = uri && !errored;
  const label = toInitials(name);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--input)] text-[var(--muted)]",
        ring && "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--background)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={uri as string}
          alt={name ?? "avatar"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : name ? (
        <span
          className="font-semibold text-[var(--foreground)]"
          style={{ fontSize: size * 0.38 }}
        >
          {label}
        </span>
      ) : (
        <UserIcon style={{ width: size * 0.55, height: size * 0.55 }} />
      )}
    </div>
  );
}
