"use client";

/** Group info: description, members, and join/leave. */

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LogOut, MessageSquare, Users } from "lucide-react";
import toast from "react-hot-toast";

import { AppHeader, EmptyState, GlassCard, PrimaryButton, Skeleton, UserAvatar } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId } from "@/lib/query/hooks";
import {
  getConversation,
  getGroupMembers,
  joinGroup,
  leaveGroup,
} from "@/lib/api/chat";

export default function GroupDetailPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const groupQuery = useQuery({
    queryKey: ["conversation", groupId],
    enabled: !!groupId,
    queryFn: () => getConversation(groupId),
  });

  const membersQuery = useQuery({
    queryKey: ["group-members", groupId],
    enabled: !!groupId,
    queryFn: () => getGroupMembers(groupId),
  });

  const group = groupQuery.data;
  const members = membersQuery.data ?? [];
  const isMember = members.some((m) => m.id === currentUserId);
  const isCreator = !!currentUserId && group?.created_by === currentUserId;

  const handleJoin = async () => {
    if (!currentUserId) return;
    try {
      await joinGroup(groupId, currentUserId);
      toast.success("Joined group");
      await membersQuery.refetch();
      router.push(`/chat/${groupId}`);
    } catch {
      toast.error("Couldn't join that group");
    }
  };

  const handleLeave = async () => {
    if (!currentUserId) return;
    if (!window.confirm("Leave this group?")) return;
    try {
      await leaveGroup(groupId, currentUserId);
      toast.success("Left group");
      router.push("/groups");
    } catch {
      toast.error("Couldn't leave the group");
    }
  };

  return (
    <div className="min-h-full">
      <AppHeader title="Group Info" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        {groupQuery.isLoading ? (
          <Skeleton className="h-40 w-full rounded-[16px]" />
        ) : !group ? (
          <EmptyState
            title="Group not found"
            message="This group may have been removed."
            action={
              <PrimaryButton onClick={() => router.push("/groups")}>
                Back to groups
              </PrimaryButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-5">
            <GlassCard className="flex flex-col items-center gap-3 p-6 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple)]">
                <Users className="h-9 w-9" />
              </span>
              <h1 className="text-xl font-extrabold text-[var(--foreground)]">
                {group.title || "Group"}
              </h1>
              {group.description && (
                <p className="text-sm text-[var(--muted)]">{group.description}</p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {group.category && (
                  <span className="rounded-full bg-[var(--input)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
                    {group.category}
                  </span>
                )}
                <span className="rounded-full bg-[var(--input)] px-3 py-1 text-[11px] font-semibold text-[var(--muted)]">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </div>

              {isMember ? (
                <Link
                  href={`/chat/${groupId}`}
                  className="mt-2 flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
                >
                  <MessageSquare className="h-4 w-4" />
                  Open chat
                </Link>
              ) : (
                <PrimaryButton className="mt-2" fullWidth={false} onClick={handleJoin}>
                  Join group
                </PrimaryButton>
              )}
            </GlassCard>

            <section>
              <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Members
              </h2>
              {membersQuery.isLoading ? (
                <Skeleton className="h-24 w-full rounded-[16px]" />
              ) : (
                <ul className="flex flex-col">
                  {members.map((member) => {
                    const name = member.full_name || member.username || "User";
                    return (
                      <li key={member.id}>
                        <Link
                          href={`/u/${member.id}`}
                          className="flex items-center gap-3 rounded-[16px] px-2 py-2.5 transition hover:bg-[var(--input)]"
                        >
                          <UserAvatar
                            uri={member.avatar_url ?? undefined}
                            name={name}
                            size={40}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold text-[var(--foreground)]">
                              {name}
                            </span>
                            <span className="block truncate text-sm text-[var(--muted)]">
                              @{member.username || "user"}
                            </span>
                          </span>
                          {member.role === "admin" && (
                            <span className="shrink-0 rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
                              Admin
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {isMember && !isCreator && (
              <button
                type="button"
                onClick={handleLeave}
                className="flex items-center justify-center gap-2 rounded-full border border-[var(--error)]/40 px-5 py-3 text-sm font-semibold text-[var(--error)] transition hover:bg-[var(--error)]/10"
              >
                <LogOut className="h-4 w-4" />
                Leave group
              </button>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
