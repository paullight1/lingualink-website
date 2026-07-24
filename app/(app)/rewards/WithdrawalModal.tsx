"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Wallet, X } from "lucide-react";
import { PrimaryButton } from "@/components/ui";
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

  const amountNum = parseFloat(amount);
  const isValid =
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-[32px] border border-[var(--border-light)] bg-[var(--surface)] p-6 pb-8 shadow-lg sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white">
              <Wallet className="h-4 w-4" />
            </span>
            <h2 className="text-lg font-extrabold text-[var(--foreground)]">
              Withdraw funds
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-[var(--muted)]">
          Available balance:{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {formatUsd(availableBalance)}
          </span>
        </p>

        <div className="mb-2 flex items-center justify-center gap-2 rounded-[24px] border border-[var(--color-primary)]/30 bg-[var(--input)] py-3">
          <span className="text-3xl font-extrabold text-[var(--foreground)]">
            $
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={MIN_WITHDRAWAL}
            max={availableBalance}
            step="0.01"
            autoFocus
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32 bg-transparent text-center text-3xl font-extrabold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
        <p className="mb-6 text-center text-xs text-[var(--muted)]">
          Minimum withdrawal: {formatUsd(MIN_WITHDRAWAL)}
        </p>

        <PrimaryButton onClick={handleSubmit} loading={submitting} disabled={!isValid}>
          Request payout
        </PrimaryButton>
      </div>
    </div>
  );
}
