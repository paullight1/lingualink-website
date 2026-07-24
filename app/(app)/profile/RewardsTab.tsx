"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  RefreshCcw,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { monetizationApi } from "@/lib/api/monetization";
import { supabase } from "@/lib/supabase/client";
import { qk } from "@/lib/query/keys";
import { EmptyState, GlassCard, Skeleton } from "@/components/ui";
import { MonetizationProgressCard } from "@/components/profile/MonetizationProgressCard";
import { cn, formatUsd, timeAgo } from "@/lib/utils";
import type { TransactionRow } from "@/lib/types";

const TYPE_META: Record<string, { icon: ReactNode; color: string }> = {
  earning: { icon: <ArrowDownCircle className="h-4 w-4" />, color: "var(--success)" },
  withdrawal: { icon: <ArrowUpCircle className="h-4 w-4" />, color: "var(--error)" },
  bonus: { icon: <Gift className="h-4 w-4" />, color: "var(--color-accent-purple)" },
  penalty: { icon: <TriangleAlert className="h-4 w-4" />, color: "var(--warning)" },
  refund: { icon: <RefreshCcw className="h-4 w-4" />, color: "var(--color-accent-blue)" },
};

async function fetchTransactions(userId: string): Promise<TransactionRow[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as TransactionRow[];
}

/** Rewards tab: monetization progress, earnings summary, recent transactions. */
export function RewardsTab({ userId }: { userId: string }) {
  const earnings = useQuery({
    queryKey: qk.earnings(),
    queryFn: () => monetizationApi.getEarningsSummary(),
  });
  const status = useQuery({
    queryKey: qk.monetizationStatus(),
    queryFn: () => monetizationApi.getMonetizationStatus(),
  });
  const transactions = useQuery({
    queryKey: [...qk.transactions(), userId],
    queryFn: () => fetchTransactions(userId),
    enabled: !!userId,
  });

  return (
    <div className="flex flex-col gap-4">
      {status.isLoading ? (
        <Skeleton className="h-44 w-full rounded-[24px]" />
      ) : status.data ? (
        <MonetizationProgressCard status={status.data} />
      ) : null}

      <GlassCard className="p-5">
        <h3 className="mb-4 text-base font-bold text-[var(--foreground)]">Earnings</h3>
        {earnings.isLoading ? (
          <Skeleton className="h-16 w-full rounded-[12px]" />
        ) : earnings.data ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[12px] bg-[var(--input)] p-4 text-center">
                <p className="text-xl font-extrabold text-[var(--foreground)]">
                  {formatUsd(earnings.data.balance)}
                </p>
                <p className="text-xs text-[var(--muted)]">Balance</p>
              </div>
              <div className="rounded-[12px] bg-[var(--input)] p-4 text-center">
                <p className="text-xl font-extrabold text-[var(--foreground)]">
                  {formatUsd(earnings.data.totalEarned)}
                </p>
                <p className="text-xs text-[var(--muted)]">Total Earned</p>
              </div>
            </div>
            {earnings.data.validatorTier && (
              <p className="mt-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                {earnings.data.validatorTier} validator
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-[var(--muted)]">Earnings unavailable right now.</p>
        )}
      </GlassCard>

      <div>
        <h3 className="mb-3 text-base font-bold text-[var(--foreground)]">
          Recent Transactions
        </h3>
        {transactions.isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[12px]" />
            ))}
          </div>
        ) : transactions.isError ? (
          <p className="text-sm text-[var(--muted)]">Couldn&apos;t load transactions.</p>
        ) : !transactions.data || transactions.data.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-7 w-7" />}
            title="No transactions yet"
            message="Your earnings and withdrawals will show up here."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.data.map((tx) => {
              const meta = TYPE_META[tx.type ?? "earning"] ?? TYPE_META.earning;
              const positive = (tx.amount ?? 0) >= 0;
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-[12px] border border-[var(--border-light)] bg-[var(--surface)] px-4 py-3"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                      color: meta.color,
                    }}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {tx.description || tx.type || "Transaction"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{timeAgo(tx.created_at)}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold",
                      positive ? "text-[var(--success)]" : "text-[var(--error)]"
                    )}
                  >
                    {positive ? "+" : ""}
                    {formatUsd(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
