"use client";

/** Owner: Agent 16 — rewards/wallet (balance, monetization progress, withdrawals, transactions). */

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Mic, TrendingUp, Wallet } from "lucide-react";
import {
  AppHeader,
  EmptyState,
  GlassCard,
  PrimaryButton,
  Skeleton,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId, useMyProfile } from "@/lib/query/hooks";
import { qk } from "@/lib/query/keys";
import { monetizationApi } from "@/lib/api/monetization";
import { supabase } from "@/lib/supabase/client";
import { cn, formatUsd, timeAgo } from "@/lib/utils";
import type { TransactionRow } from "@/lib/types";
import { MonetizationProgress } from "./MonetizationProgress";
import { WithdrawalModal } from "./WithdrawalModal";

async function fetchTransactions(userId: string): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data as TransactionRow[]) ?? [];
}

function TransactionItem({ tx }: { tx: TransactionRow }) {
  const positive = tx.amount > 0;
  return (
    <GlassCard className="mb-2 flex items-center gap-3 p-3">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          positive
            ? "bg-[var(--success)]/10 text-[var(--success)]"
            : "bg-[var(--error)]/10 text-[var(--error)]"
        )}
      >
        {positive ? (
          <CheckCircle2 className="h-[18px] w-[18px]" />
        ) : (
          <CreditCard className="h-[18px] w-[18px]" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-[var(--foreground)]">
          {tx.description || "Transaction"}
        </p>
        <p className="text-xs text-[var(--muted)]">{timeAgo(tx.created_at)}</p>
      </div>
      <span
        className={cn(
          "shrink-0 font-bold",
          positive ? "text-[var(--success)]" : "text-[var(--error)]"
        )}
      >
        {positive ? "+" : ""}
        {formatUsd(tx.amount)}
      </span>
    </GlassCard>
  );
}

function EarnMoreCard({
  href,
  icon,
  iconColor,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-[16px] border border-[var(--border-light)] bg-[var(--card)] p-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center" style={{ color: iconColor }}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[var(--foreground)]">{title}</p>
        <p className="text-xs text-[var(--muted)]">{description}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white hover:brightness-105"
      >
        Start
      </Link>
    </div>
  );
}

export default function RewardsPage() {
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const [showWithdraw, setShowWithdraw] = useState(false);

  const { data: monetizationStatus } = useQuery({
    queryKey: qk.monetizationStatus(),
    enabled: !!userId,
    queryFn: () => monetizationApi.getMonetizationStatus(),
  });

  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: qk.transactions(),
    enabled: !!userId,
    queryFn: () => fetchTransactions(userId as string),
  });

  const balance = profile?.balance ?? 0;
  const totalEarned = profile?.total_earned ?? 0;

  const handleWithdrawSuccess = () => {
    queryClient.invalidateQueries({ queryKey: qk.myProfile() });
    queryClient.invalidateQueries({ queryKey: qk.transactions() });
  };

  return (
    <>
      <AppHeader title="Wallet" />
      <PageContainer size="md">
        {/* Balance + monetization progress + withdraw */}
        <GlassCard intensity={30} className="mb-6 p-6">
          <div className="mb-6 flex flex-col items-center gap-1 text-center">
            <p className="text-sm text-[var(--muted)]">Available Balance</p>
            {profileLoading ? (
              <Skeleton className="h-11 w-40" />
            ) : (
              <p className="text-[42px] font-extrabold leading-tight tracking-tight text-[var(--color-primary)]">
                {formatUsd(balance)}
              </p>
            )}
            <p className="text-sm font-bold text-[var(--foreground)] opacity-80">USD</p>
          </div>

          {monetizationStatus && (
            <div className="mb-6">
              <MonetizationProgress status={monetizationStatus} />
            </div>
          )}

          <PrimaryButton
            leftIcon={<Wallet className="h-[18px] w-[18px]" />}
            onClick={() => setShowWithdraw(true)}
          >
            Withdraw
          </PrimaryButton>
        </GlassCard>

        {/* Total earned stat */}
        <div className="mb-6 flex items-center gap-3 rounded-[16px] border border-[var(--border-light)] bg-[var(--card)] p-4">
          <TrendingUp className="h-6 w-6 shrink-0 text-[var(--success)]" />
          <div className="min-w-0">
            {profileLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p className="text-lg font-bold text-[var(--foreground)]">
                {formatUsd(totalEarned)}
              </p>
            )}
            <p className="text-xs text-[var(--muted)]">Total Earned</p>
          </div>
        </div>

        {/* Recent transactions */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">
            Recent Transactions
          </h2>
          {txLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-16 w-full rounded-[24px]" />
              <Skeleton className="h-16 w-full rounded-[24px]" />
              <Skeleton className="h-16 w-full rounded-[24px]" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            transactions.map((tx) => <TransactionItem key={tx.id} tx={tx} />)
          ) : (
            <EmptyState
              icon={<Wallet className="h-7 w-7" />}
              title="No transactions yet"
              message="Start validating to earn!"
            />
          )}
        </section>

        {/* Earn more */}
        <section>
          <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">Earn More</h2>
          <EarnMoreCard
            href="/record"
            icon={<Mic className="h-6 w-6" />}
            iconColor="var(--color-primary)"
            title="Record Voice Clips"
            description="Earn points per validated clip"
          />
          <EarnMoreCard
            href="/validate"
            icon={<CheckCircle2 className="h-6 w-6" />}
            iconColor="var(--success)"
            title="Validate Recordings"
            description="Earn 10 points per validation"
          />
        </section>
      </PageContainer>

      {showWithdraw && (
        <WithdrawalModal
          availableBalance={balance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </>
  );
}
