"use client";

/** Invite friends with your referral code and see who has joined. */

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Copy, Gift, Share2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { AppHeader, EmptyState, GlassCard, Skeleton, UserAvatar } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId, useMyProfile } from "@/lib/query/hooks";
import { supabase } from "@/lib/supabase/client";
import { inviteMessage, referralCodeFor } from "@/lib/api/ambassador";
import { timeAgo } from "@/lib/utils";

interface Invitee {
  id: string;
  created_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

/**
 * People who signed up with this user's code. Resolves the user's
 * `referral_codes` row first, the same way the settings referral card does.
 */
async function fetchInvitees(userId: string): Promise<Invitee[]> {
  const { data: codeRow } = await supabase
    .from("referral_codes")
    .select("id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (!codeRow?.id) return [];

  const { data, error } = await supabase
    .from("referrals")
    .select("id, created_at, referred_user:profiles(username, full_name, avatar_url)")
    .eq("referral_code_id", codeRow.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[invites] fetch failed", error);
    return [];
  }

  type Row = {
    id: string;
    created_at: string;
    referred_user:
      | { username: string | null; full_name: string | null; avatar_url: string | null }
      | null;
  };

  return ((data as unknown as Row[]) ?? []).map((row) => ({
    id: row.id,
    created_at: row.created_at,
    username: row.referred_user?.username ?? null,
    full_name: row.referred_user?.full_name ?? null,
    avatar_url: row.referred_user?.avatar_url ?? null,
  }));
}

export default function InvitesPage() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const { data: profile } = useMyProfile();

  const code = referralCodeFor(profile?.username);

  const { data: invitees, isLoading } = useQuery({
    queryKey: ["invitees", userId],
    enabled: !!userId,
    queryFn: () => fetchInvitees(userId as string),
  });

  const list = invitees ?? [];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Referral code copied");
    } catch {
      toast.error("Couldn't copy the code");
    }
  };

  const handleShare = async () => {
    const text = inviteMessage(code);
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Invite message copied");
    } catch {
      // share sheet dismissed
    }
  };

  return (
    <div className="min-h-full">
      <AppHeader title="Invite Friends" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        <GlassCard className="mb-5 flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <Gift className="h-6 w-6" />
          </span>
          <h1 className="text-lg font-bold text-[var(--foreground)]">
            Invite friends, earn together
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Share your code. When someone joins with it, you both get rewards.
          </p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-primary)]">
            {code}
          </p>

          <div className="mt-2 flex w-full gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border-light)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)]"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-glow"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </GlassCard>

        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Joined with your code ({list.length})
        </h2>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[16px]" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-7 w-7" />}
            title="No invites yet"
            message="Share your code to get started."
          />
        ) : (
          <ul className="flex flex-col">
            {list.map((invitee) => {
              const name = invitee.full_name || invitee.username || "New member";
              return (
                <li
                  key={invitee.id}
                  className="flex items-center gap-3 rounded-[16px] px-2 py-2.5"
                >
                  <UserAvatar
                    uri={invitee.avatar_url ?? undefined}
                    name={name}
                    size={40}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-[var(--foreground)]">
                      {name}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      Joined {timeAgo(invitee.created_at)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
