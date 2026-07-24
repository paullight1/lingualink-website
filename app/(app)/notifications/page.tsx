"use client";

/** Owner: Agent 19 — notifications feed (fetch, mark-all-read, actor link). Built per FOUNDATION.md. */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Bell, Heart } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppHeader, EmptyState, GlassCard, Skeleton, UserAvatar } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { supabase } from "@/lib/supabase/client";
import { useCurrentUserId } from "@/lib/query/hooks";
import { qk } from "@/lib/query/keys";
import { cn, timeAgo } from "@/lib/utils";
import type { NotificationRow } from "@/lib/types";

async function fetchNotifications(userId: string): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, message, is_read, created_at, data")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data as NotificationRow[]) ?? [];
}

export default function NotificationsPage() {
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();
  const markedRef = useRef(false);

  const { data: notifications, isLoading } = useQuery({
    queryKey: qk.notifications(),
    enabled: !!userId,
    queryFn: () => fetchNotifications(userId as string),
  });

  // Mark all unread as read once, optimistically updating the cache.
  useEffect(() => {
    if (!userId || markedRef.current || !notifications?.some((n) => !n.is_read)) return;
    markedRef.current = true;

    queryClient.setQueryData<NotificationRow[]>(qk.notifications(), (prev) =>
      prev?.map((n) => (n.is_read ? n : { ...n, is_read: true }))
    );

    supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .then(({ error }) => {
        if (error) console.error("Error marking notifications as read:", error);
      });
  }, [userId, notifications, queryClient]);

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Notifications" />
      <PageContainer size="sm">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[76px] w-full rounded-[16px]" />
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-7 w-7" />}
            title="All caught up!"
            message="No new notifications at the moment."
            className="mt-16"
          />
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => (
              <NotificationRowItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

function NotificationRowItem({ notification }: { notification: NotificationRow }) {
  const actorName = notification.data?.actorName || "Someone";
  const actorAvatarUrl = notification.data?.actorAvatarUrl;
  const actorId = notification.data?.actorId;
  const text = notification.message || notification.title || "";
  const isLike = notification.type === "like";

  const content = (
    <GlassCard
      intensity={notification.is_read ? 15 : 25}
      className="relative flex items-center gap-3 p-4"
    >
      {!notification.is_read && (
        <span
          aria-hidden
          className="absolute left-2 top-4 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
        />
      )}
      <UserAvatar uri={actorAvatarUrl} name={actorName} size={44} className="ml-2 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-5 text-[var(--foreground)] sm:whitespace-normal">
          {text}
        </p>
        <p className="mt-1 text-[11px] text-[var(--muted)]">{timeAgo(notification.created_at)}</p>
      </div>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isLike ? "bg-[var(--error)]/10" : "bg-[var(--color-primary)]/10"
        )}
      >
        {isLike ? (
          <Heart className="h-4 w-4 text-[var(--error)]" />
        ) : (
          <Bell className="h-4 w-4 text-[var(--color-primary)]" />
        )}
      </div>
    </GlassCard>
  );

  if (actorId) {
    return (
      <Link href={`/u/${actorId}`} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
