"use client";

/** Post-stream recap — mirrors the mobile LiveStreamSummaryScreen. */

import { useRouter, useSearchParams } from "next/navigation";
import { Clock, PartyPopper, Radio, Users } from "lucide-react";

import { GlassCard, PrimaryButton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatDuration } from "@/lib/utils";

export default function LiveSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const duration = Number(searchParams.get("duration") ?? 0);
  const viewers = Number(searchParams.get("viewers") ?? 0);

  return (
    <PageContainer size="sm" className="flex min-h-dvh flex-col justify-center py-10">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
          <PartyPopper className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)]">
          That&apos;s a wrap
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Your stream has ended. Here&apos;s how it went.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <GlassCard className="flex flex-col items-center gap-1.5 p-5 text-center">
          <Clock className="h-5 w-5 text-[var(--color-primary)]" />
          <span className="text-xl font-extrabold tabular-nums text-[var(--foreground)]">
            {formatDuration(duration)}
          </span>
          <span className="text-xs text-[var(--muted)]">Time live</span>
        </GlassCard>

        <GlassCard className="flex flex-col items-center gap-1.5 p-5 text-center">
          <Users className="h-5 w-5 text-[var(--color-accent-purple)]" />
          <span className="text-xl font-extrabold tabular-nums text-[var(--foreground)]">
            {viewers}
          </span>
          <span className="text-xs text-[var(--muted)]">Peak viewers</span>
        </GlassCard>
      </div>

      <div className="flex flex-col gap-3">
        <PrimaryButton
          onClick={() => router.push("/live/new")}
          leftIcon={<Radio className="h-5 w-5" />}
        >
          Go live again
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={() => router.push("/feed")}>
          Back to feed
        </PrimaryButton>
      </div>
    </PageContainer>
  );
}
