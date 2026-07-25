"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Building2, Wallet } from "lucide-react";
import { ModalSheet, PrimaryButton } from "@/components/ui";
import { monetizationApi } from "@/lib/api/monetization";
import { formatUsd } from "@/lib/utils";

const MIN_WITHDRAWAL = 5;

/** Simple withdrawal sheet: amount input -> monetizationApi.requestWithdrawal(amount). */
export function WithdrawalModal({
  availableBalance,
  onClose,
  onSuccess,
}: {
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const linkedQuery = useQuery({
    queryKey: ["linked-bank"],
    queryFn: () => monetizationApi.getLinkedBank(),
  });
  const linkedBank = linkedQuery.data;
  const hasBank = !!linkedBank?.accountNumberLast4;

  const amountNum = parseFloat(amount);
  const isValid =
    hasBank &&
    !Number.isNaN(amountNum) &&
    amountNum >= MIN_WITHDRAWAL &&
    amountNum <= availableBalance;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await monetizationApi.requestWithdrawal(amountNum);
      toast.success(
        `Withdrawal of ${formatUsd(amountNum)} submitted. It will be processed within 24 hours.`
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit withdrawal."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Only tell the user what's wrong once they've actually typed something.
  const amountError =
    amount.trim() === "" || Number.isNaN(amountNum)
      ? ""
      : amountNum < MIN_WITHDRAWAL
        ? `Minimum withdrawal is ${formatUsd(MIN_WITHDRAWAL)}`
        : amountNum > availableBalance
          ? `That's more than your ${formatUsd(availableBalance)} balance`
          : "";

  return (
    <ModalSheet
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white">
            <Wallet className="h-4 w-4" />
          </span>
          Withdraw funds
        </span>
      }
      footer={
        <PrimaryButton onClick={handleSubmit} loading={submitting} disabled={!isValid}>
          Request payout
        </PrimaryButton>
      }
    >
      <p className="mb-4 text-sm text-[var(--muted)]">
        Available balance:{" "}
        <span className="font-semibold text-[var(--foreground)]">
          {formatUsd(availableBalance)}
        </span>
      </p>

      {/* Payouts need a destination account — same precondition as mobile. */}
      {linkedQuery.isLoading ? (
        <div className="mb-4 h-12 animate-pulse rounded-2xl bg-[var(--input)]" />
      ) : linkedBank?.accountNumberLast4 ? (
        <div className="mb-4 flex items-center gap-2 rounded-[16px] bg-[var(--input)] px-4 py-3">
          <Building2 className="h-4 w-4 shrink-0 text-[var(--muted)]" />
          <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">
            {linkedBank.bankName} ••••{linkedBank.accountNumberLast4}
          </span>
          <Link
            href="/payment-settings"
            className="shrink-0 text-xs font-semibold text-[var(--color-primary)]"
          >
            Change
          </Link>
        </div>
      ) : (
        <div className="mb-4 rounded-[16px] border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-3">
          <p className="text-sm text-[var(--foreground)]">
            Link a bank account before withdrawing.
          </p>
          <Link
            href="/payment-settings"
            className="mt-1 inline-block text-sm font-semibold text-[var(--color-primary)]"
          >
            Add payout account →
          </Link>
        </div>
      )}

      <label
        htmlFor="withdrawal-amount"
        className="mb-2 block text-[13px] font-semibold text-[var(--foreground)]"
      >
        Amount
      </label>
      <div
        className={`flex items-center justify-center gap-1 rounded-[20px] border bg-[var(--field-bg)] py-4 transition-colors focus-within:shadow-[0_0_0_4px_var(--field-ring)] ${
          amountError
            ? "border-[var(--error)] focus-within:shadow-[0_0_0_4px_var(--field-ring-error)]"
            : "border-[var(--field-border)] focus-within:border-[var(--color-primary)]"
        }`}
      >
        <span className="text-[32px] font-extrabold leading-none text-[var(--muted-2)]">
          $
        </span>
        <input
          id="withdrawal-amount"
          type="number"
          inputMode="decimal"
          min={MIN_WITHDRAWAL}
          max={availableBalance}
          step="0.01"
          autoFocus
          placeholder="0.00"
          value={amount}
          aria-invalid={Boolean(amountError) || undefined}
          aria-describedby="withdrawal-amount-hint"
          onChange={(e) => setAmount(e.target.value)}
          className="w-36 bg-transparent text-center text-[32px] font-extrabold leading-none tabular-nums text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]"
        />
      </div>
      <p
        id="withdrawal-amount-hint"
        className={`mt-2 text-center text-xs ${
          amountError ? "font-medium text-[var(--error)]" : "text-[var(--muted-2)]"
        }`}
      >
        {amountError || `Minimum withdrawal: ${formatUsd(MIN_WITHDRAWAL)}`}
      </p>
    </ModalSheet>
  );
}
