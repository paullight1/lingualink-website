"use client";

/** Owner: Agent 18 — store (featured rewards, redemption demo). */

import toast from "react-hot-toast";
import { AppHeader, GlassCard, PrimaryButton, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useMyProfile } from "@/lib/query/hooks";
import { cn, formatUsd } from "@/lib/utils";
import { mockRewardItems, comingSoonItems, type RewardItem } from "./rewards-data";

function RewardCard({ item, balance }: { item: RewardItem; balance: number }) {
  const affordable = balance >= item.cost;

  const handleRedeem = () => {
    if (!affordable) return;
    toast.success(`Redeemed "${item.title}" (demo)`);
  };

  return (
    <GlassCard
      className={cn(
        "flex items-center gap-4 p-4 transition-opacity",
        !affordable && "opacity-60"
      )}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--input)] text-2xl">
        {item.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-[var(--foreground)]">{item.title}</p>
        <p className="mb-2 truncate text-sm text-[var(--muted)]">{item.description}</p>
        <span className="inline-block rounded-md bg-[var(--input)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)]">
          {item.category}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="text-right">
          <p className="font-bold text-[var(--color-primary)]">${item.cost}</p>
          <p className="text-[10px] text-[var(--muted)]">USD</p>
        </div>
        <PrimaryButton
          size="sm"
          fullWidth={false}
          disabled={!affordable}
          onClick={handleRedeem}
        >
          Get
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}

export default function StorePage() {
  const { data: profile, isLoading } = useMyProfile();
  const balance = profile?.balance ?? 0;

  return (
    <>
      <AppHeader title="Store" />
      <PageContainer size="md">
        {/* Balance card */}
        <GlassCard className="mb-8 flex flex-col items-center gap-2 px-6 py-6 text-center">
          <p className="text-sm text-[var(--muted)]">Available Balance</p>
          {isLoading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <p className="text-3xl font-extrabold tracking-tight text-[var(--color-primary)]">
              {formatUsd(balance)}
            </p>
          )}
        </GlassCard>

        {/* Featured rewards */}
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">Featured Rewards</h2>
        <div className="mb-8 flex flex-col gap-4">
          {mockRewardItems.map((item) => (
            <RewardCard key={item.id} item={item} balance={balance} />
          ))}
        </div>

        {/* Coming soon */}
        <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">Coming Soon</h2>
        <GlassCard className="flex flex-col gap-3 p-5">
          {comingSoonItems.map((label) => (
            <p key={label} className="text-[15px] text-[var(--muted)]">
              {label}
            </p>
          ))}
        </GlassCard>
      </PageContainer>
    </>
  );
}
