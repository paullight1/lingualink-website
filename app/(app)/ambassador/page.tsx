"use client";

/** Ambassador programme: referral code, stats, leaderboard, and application. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Copy, MapPin, Megaphone, Share2, Trophy, Users } from "lucide-react";
import toast from "react-hot-toast";

import {
  AppHeader,
  Field,
  GlassCard,
  Input,
  PrimaryButton,
  Skeleton,
  Textarea,
  UserAvatar,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId, useMyProfile } from "@/lib/query/hooks";
import {
  applyForAmbassador,
  getApplicationStatus,
  getLeaderboard,
  getStats,
  inviteMessage,
  referralCodeFor,
} from "@/lib/api/ambassador";
import { formatUsd, cn } from "@/lib/utils";

const STATUS_COPY: Record<string, { label: string; tone: string }> = {
  approved: { label: "Ambassador", tone: "var(--success)" },
  pending: { label: "Application under review", tone: "var(--warning)" },
  rejected: { label: "Application not accepted", tone: "var(--error)" },
};

export default function AmbassadorPage() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const { data: profile } = useMyProfile();

  const [region, setRegion] = useState("");
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const statusQuery = useQuery({
    queryKey: ["ambassador-status", userId],
    enabled: !!userId,
    queryFn: getApplicationStatus,
  });

  const statsQuery = useQuery({
    queryKey: ["ambassador-stats", userId],
    enabled: !!userId,
    queryFn: getStats,
  });

  const leaderboardQuery = useQuery({
    queryKey: ["ambassador-leaderboard"],
    queryFn: getLeaderboard,
  });

  const code = referralCodeFor(profile?.username);
  const status = statusQuery.data ?? "none";
  const statusInfo = STATUS_COPY[status];

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
      // user dismissed the share sheet
    }
  };

  const handleApply = async () => {
    if (!region.trim() || !motivation.trim()) {
      toast.error("Please fill in your region and motivation.");
      return;
    }
    setSubmitting(true);
    try {
      await applyForAmbassador({
        region: region.trim(),
        motivation: motivation.trim(),
        experienceDetails: experience.trim() || undefined,
      });
      toast.success("Application submitted — it's under review.");
      await statusQuery.refetch();
    } catch (err) {
      console.error("[ambassador] apply failed", err);
      toast.error("Couldn't submit your application");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = statsQuery.data;

  return (
    <div className="min-h-full">
      <AppHeader title="Ambassador Program" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        {/* Referral hero */}
        <GlassCard className="mb-5 flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <Megaphone className="h-6 w-6" />
          </span>
          <p className="text-sm text-[var(--muted)]">Your referral code</p>
          <p className="text-3xl font-extrabold tracking-tight text-[var(--color-primary)]">
            {code}
          </p>

          {statusInfo && (
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor: `color-mix(in srgb, ${statusInfo.tone} 15%, transparent)`,
                color: statusInfo.tone,
              }}
            >
              {statusInfo.label}
            </span>
          )}

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

        {/* Stats */}
        {statsQuery.isLoading ? (
          <Skeleton className="mb-5 h-24 w-full rounded-[16px]" />
        ) : (
          stats && (
            <div className="mb-5 grid grid-cols-2 gap-3">
              <GlassCard className="flex flex-col items-center gap-1 p-4 text-center">
                <Users className="h-5 w-5 text-[var(--color-primary)]" />
                <span className="text-xl font-extrabold tabular-nums text-[var(--foreground)]">
                  {stats.totalReferrals ?? 0}
                </span>
                <span className="text-xs text-[var(--muted)]">Referrals</span>
              </GlassCard>
              <GlassCard className="flex flex-col items-center gap-1 p-4 text-center">
                <Trophy className="h-5 w-5 text-[var(--color-accent-green)]" />
                <span className="text-xl font-extrabold tabular-nums text-[var(--foreground)]">
                  {formatUsd(stats.totalEarned ?? 0)}
                </span>
                <span className="text-xs text-[var(--muted)]">Earned</span>
              </GlassCard>
            </div>
          )
        )}

        {/* Application form, only when not already in the programme */}
        {status === "none" && (
          <GlassCard className="mb-5 p-5">
            <h2 className="mb-1 text-lg font-bold text-[var(--foreground)]">
              Become an ambassador
            </h2>
            <p className="mb-4 text-sm text-[var(--muted)]">
              Help us grow LinguaLink in your region and earn monthly stipends
              plus referral bonuses.
            </p>

            <div className="mb-4 flex flex-col gap-4">
              <Field label="Your region">
                <Input
                  icon={MapPin}
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="Lagos, Nigeria"
                />
              </Field>

              <Field label="Why do you want to be an ambassador?">
                <Textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  rows={3}
                  placeholder="Tell us what you'd do in your community"
                />
              </Field>

              <Field label="Relevant experience" optional>
                <Textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={2}
                  placeholder="Community work, teaching, content creation…"
                />
              </Field>
            </div>

            <PrimaryButton
              loading={submitting}
              disabled={submitting || !region.trim() || !motivation.trim()}
              onClick={handleApply}
            >
              Submit Application
            </PrimaryButton>
          </GlassCard>
        )}

        {/* Leaderboard */}
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Top ambassadors
        </h2>
        {leaderboardQuery.isLoading ? (
          <Skeleton className="h-32 w-full rounded-[16px]" />
        ) : (leaderboardQuery.data ?? []).length === 0 ? (
          <p className="px-1 text-sm text-[var(--muted)]">
            No ambassadors ranked yet.
          </p>
        ) : (
          <ul className="flex flex-col">
            {(leaderboardQuery.data ?? []).map((entry, index) => (
              <li
                key={entry.userId}
                className="flex items-center gap-3 rounded-[16px] px-2 py-2.5"
              >
                <span
                  className={cn(
                    "w-6 shrink-0 text-center text-sm font-bold tabular-nums",
                    index < 3
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--muted)]"
                  )}
                >
                  {index + 1}
                </span>
                <UserAvatar
                  uri={entry.avatarUrl ?? undefined}
                  name={entry.username ?? "Ambassador"}
                  size={36}
                />
                <span className="min-w-0 flex-1 truncate font-semibold text-[var(--foreground)]">
                  @{entry.username ?? "ambassador"}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-[var(--muted)]">
                  {entry.referrals} refs
                </span>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
