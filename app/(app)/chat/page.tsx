"use client";

/** Conversation list — DMs and groups, with unread badges and realtime updates. */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, SquarePen, Users } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import {
  EmptyState,
  SearchInput,
  SegmentedTabs,
  Skeleton,
  UserAvatar,
} from "@/components/ui";
import { useCurrentUserId } from "@/lib/query/hooks";
import { useRealtime } from "@/lib/query/useRealtime";
import { timeAgo, cn } from "@/lib/utils";
import {
  getConversations,
  getProfiles,
  type ConversationSummary,
} from "@/lib/api/chat";
import { supabase } from "@/lib/supabase/client";

type ChatTab = "dms" | "groups";

/**
 * DM rows only store participants in `conversation_members`, so titles and
 * avatars come from a second lookup. Resolved in one batch for the whole list.
 */
async function loadConversationsWithPeers(userId: string) {
  const conversations = await getConversations();
  const dmIds = conversations.filter((c) => !c.is_group).map((c) => c.id);
  if (dmIds.length === 0) return { conversations, peerByConversation: {} };

  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id")
    .in("conversation_id", dmIds)
    .neq("user_id", userId);

  if (error) {
    console.error("[chat] DM peers lookup failed", error);
    return { conversations, peerByConversation: {} };
  }

  const rows = (data as { conversation_id: string; user_id: string }[]) ?? [];
  const profiles = await getProfiles([...new Set(rows.map((r) => r.user_id))]);
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const peerByConversation: Record<
    string,
    { id: string; name: string; avatar: string | null }
  > = {};
  for (const row of rows) {
    const profile = profileById.get(row.user_id);
    peerByConversation[row.conversation_id] = {
      id: row.user_id,
      name: profile?.full_name || profile?.username || "User",
      avatar: profile?.avatar_url ?? null,
    };
  }

  return { conversations, peerByConversation };
}

export default function ChatListPage() {
  const currentUserId = useCurrentUserId();
  const [tab, setTab] = useState<ChatTab>("dms");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["conversations", currentUserId],
    enabled: !!currentUserId,
    queryFn: () => loadConversationsWithPeers(currentUserId as string),
  });

  // New messages anywhere reorder the list and change unread counts.
  useRealtime("chat-list", [{ table: "messages", event: "INSERT" }], () => {
    refetch();
  });

  const conversations = data?.conversations ?? [];
  const peers = data?.peerByConversation ?? {};

  const titleFor = (c: ConversationSummary) =>
    c.is_group ? c.title || "Group" : peers[c.id]?.name || "Conversation";

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations
      .filter((c) => (tab === "groups" ? c.is_group : !c.is_group))
      .filter((c) => !term || titleFor(c).toLowerCase().includes(term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, peers, tab, search]);

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-[var(--border-light)] bg-[var(--background)]/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Chats</h1>
          <Link
            href="/chat/new"
            aria-label="New conversation"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow"
          >
            <SquarePen className="h-[18px] w-[18px]" />
          </Link>
        </div>

        <SearchInput
          label="Search conversations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      <PageContainer size="sm" className="pt-3">
        <SegmentedTabs
          variant="underline"
          value={tab}
          onChange={(key) => setTab(key as ChatTab)}
          className="mb-3"
          tabs={[
            { key: "dms", label: "Direct", icon: <MessageSquare className="h-4 w-4" /> },
            { key: "groups", label: "Groups", icon: <Users className="h-4 w-4" /> },
          ]}
        />

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[68px] w-full rounded-[16px]" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={
              tab === "groups" ? (
                <Users className="h-7 w-7" />
              ) : (
                <MessageSquare className="h-7 w-7" />
              )
            }
            title={
              search
                ? "No matches"
                : tab === "groups"
                ? "No groups yet"
                : "No conversations yet"
            }
            message={
              search
                ? "Try a different search."
                : tab === "groups"
                ? "Join or create a group to start talking."
                : "Start a chat with someone you follow."
            }
            action={
              !search && (
                <Link
                  href={tab === "groups" ? "/groups" : "/chat/new"}
                  className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
                >
                  {tab === "groups" ? "Browse groups" : "New chat"}
                </Link>
              )
            }
          />
        ) : (
          <ul className="flex flex-col">
            {visible.map((c) => {
              const peer = peers[c.id];
              const name = titleFor(c);
              const unread = c.unread_count > 0;
              return (
                <li key={c.id}>
                  <Link
                    href={`/chat/${c.id}`}
                    className="flex items-center gap-3 rounded-[16px] px-2 py-3 transition hover:bg-[var(--input)]"
                  >
                    {c.is_group ? (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple)]">
                        <Users className="h-5 w-5" />
                      </span>
                    ) : (
                      <UserAvatar
                        uri={peer?.avatar ?? undefined}
                        name={name}
                        size={48}
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-[15px]",
                            unread
                              ? "font-bold text-[var(--foreground)]"
                              : "font-semibold text-[var(--foreground)]"
                          )}
                        >
                          {name}
                        </span>
                        {c.last_message_at && (
                          <span className="shrink-0 text-[11px] text-[var(--muted)]">
                            {timeAgo(c.last_message_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            unread
                              ? "font-medium text-[var(--foreground)]"
                              : "text-[var(--muted)]"
                          )}
                        >
                          {c.last_message_preview || "No messages yet"}
                        </span>
                        {unread && (
                          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-bold tabular-nums text-white">
                            {c.unread_count > 99 ? "99+" : c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
