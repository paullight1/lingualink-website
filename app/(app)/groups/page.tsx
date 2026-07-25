"use client";

/** Groups: the ones you're in, plus public groups to discover and join. */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users } from "lucide-react";
import toast from "react-hot-toast";

import { PageContainer } from "@/components/layout/PageContainer";
import {
  EmptyState,
  GlassCard,
  SearchInput,
  SegmentedTabs,
  Skeleton,
} from "@/components/ui";
import { useCurrentUserId } from "@/lib/query/hooks";
import {
  discoverGroups,
  getJoinedGroups,
  joinGroup,
  type GroupConversation,
} from "@/lib/api/chat";
import { CreateGroupModal } from "./CreateGroupModal";

type GroupsTab = "mine" | "discover";

export default function GroupsPage() {
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const [tab, setTab] = useState<GroupsTab>("mine");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const myGroupsQuery = useQuery({
    queryKey: ["my-groups", currentUserId],
    enabled: !!currentUserId,
    queryFn: () => getJoinedGroups(currentUserId as string),
  });

  const discoverQuery = useQuery({
    queryKey: ["discover-groups"],
    enabled: tab === "discover",
    queryFn: () => discoverGroups(),
  });

  const myGroupIds = useMemo(
    () => new Set((myGroupsQuery.data ?? []).map((g) => g.id)),
    [myGroupsQuery.data]
  );

  const list = useMemo(() => {
    const source =
      tab === "mine"
        ? myGroupsQuery.data ?? []
        : (discoverQuery.data ?? []).filter((g) => !myGroupIds.has(g.id));
    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter(
      (g) =>
        g.title?.toLowerCase().includes(term) ||
        g.description?.toLowerCase().includes(term)
    );
  }, [tab, myGroupsQuery.data, discoverQuery.data, myGroupIds, search]);

  const loading = tab === "mine" ? myGroupsQuery.isLoading : discoverQuery.isLoading;

  const handleJoin = async (group: GroupConversation) => {
    if (!currentUserId || joining) return;
    setJoining(group.id);
    try {
      await joinGroup(group.id, currentUserId);
      toast.success(`Joined ${group.title ?? "group"}`);
      await myGroupsQuery.refetch();
      router.push(`/chat/${group.id}`);
    } catch (err) {
      console.error("[groups] join failed", err);
      toast.error("Couldn't join that group");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-[var(--border-light)] bg-[var(--background)]/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Groups</h1>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label="Create group"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <SearchInput
          label="Search groups"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      <PageContainer size="sm" className="pt-3">
        <SegmentedTabs
          variant="underline"
          value={tab}
          onChange={(key) => setTab(key as GroupsTab)}
          className="mb-4"
          tabs={[
            { key: "mine", label: "My Groups" },
            { key: "discover", label: "Discover" },
          ]}
        />

        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-[16px]" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title={
              search
                ? "No matches"
                : tab === "mine"
                ? "You're not in any groups"
                : "No groups to discover"
            }
            message={
              search
                ? "Try a different search."
                : tab === "mine"
                ? "Browse Discover to find one, or create your own."
                : "Be the first to start a group."
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((group) => (
              <GlassCard key={group.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple)]">
                    <Users className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[var(--foreground)]">
                      {group.title || "Group"}
                    </p>
                    {group.description && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-[var(--muted)]">
                        {group.description}
                      </p>
                    )}
                    {group.category && (
                      <span className="mt-2 inline-block rounded-full bg-[var(--input)] px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)]">
                        {group.category}
                      </span>
                    )}
                  </div>

                  {tab === "mine" ? (
                    <Link
                      href={`/chat/${group.id}`}
                      className="shrink-0 rounded-full border border-[var(--border-light)] px-4 py-2 text-xs font-semibold text-[var(--foreground)]"
                    >
                      Open
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoin(group)}
                      disabled={joining === group.id}
                      className="shrink-0 rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {joining === group.id ? "Joining…" : "Join"}
                    </button>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </PageContainer>

      <CreateGroupModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        userId={currentUserId}
        onCreated={(groupId) => {
          myGroupsQuery.refetch();
          router.push(`/chat/${groupId}`);
        }}
      />
    </div>
  );
}
