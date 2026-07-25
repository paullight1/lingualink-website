"use client";

/** Remix history — who has duetted your clips. */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Repeat2 } from "lucide-react";

import { AppHeader, EmptyState, GlassCard, Skeleton, UserAvatar } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId } from "@/lib/query/hooks";
import { getRemixesOfMyClips } from "@/lib/api/duets";
import { timeAgo } from "@/lib/utils";

export default function RemixHistoryPage() {
  const router = useRouter();
  const userId = useCurrentUserId();

  const { data: remixes, isLoading } = useQuery({
    queryKey: ["remix-history", userId],
    enabled: !!userId,
    queryFn: () => getRemixesOfMyClips(userId as string),
  });

  const list = remixes ?? [];

  return (
    <div className="min-h-full">
      <AppHeader title="Remix History" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        <GlassCard className="mb-5 flex items-center gap-4 p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <Repeat2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-2xl font-extrabold tabular-nums text-[var(--foreground)]">
              {list.length}
            </p>
            <p className="text-sm text-[var(--muted)]">
              {list.length === 1 ? "remix of your clips" : "remixes of your clips"}
            </p>
          </div>
        </GlassCard>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-[16px]" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Repeat2 className="h-7 w-7" />}
            title="No remixes yet"
            message="When someone duets one of your clips, it shows up here."
          />
        ) : (
          <ul className="flex flex-col">
            {list.map((remix) => (
              <li key={remix.id}>
                <Link
                  href={`/post/${remix.id}`}
                  className="flex items-center gap-3 rounded-[16px] px-2 py-3 transition hover:bg-[var(--input)]"
                >
                  <UserAvatar
                    uri={remix.remixer.avatar_url ?? undefined}
                    name={remix.remixer.username}
                    size={40}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-[var(--foreground)]">
                      <span className="font-semibold">
                        @{remix.remixer.username}
                      </span>{" "}
                      remixed{" "}
                      <span className="font-medium">
                        &ldquo;{remix.original_clip.phrase}&rdquo;
                      </span>
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      {timeAgo(remix.created_at)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
