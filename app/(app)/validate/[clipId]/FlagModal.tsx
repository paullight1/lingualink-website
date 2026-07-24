"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "@/components/ui";
import { FLAG_REASONS, type FlagReason } from "../utils";

/** Bottom-sheet modal for flagging a clip for admin review. */
export function FlagModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: FlagReason["id"], details: string) => void;
  submitting: boolean;
}) {
  const [reason, setReason] = useState<FlagReason["id"] | null>(null);
  const [details, setDetails] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] border border-[var(--border-light)] bg-[var(--card)] sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Flag for Review
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-4 text-sm text-[var(--muted)]">
            Let an admin know there&apos;s an issue with this clip.
          </p>

          <div className="flex flex-col gap-2">
            {FLAG_REASONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setReason(r.id)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                  reason === r.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "border-transparent bg-[var(--input)] hover:border-[var(--border-light)]"
                )}
              >
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full border-2",
                    reason === r.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                      : "border-[var(--muted)]"
                  )}
                />
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {r.label}
                </span>
              </button>
            ))}
          </div>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional notes (optional)"
            rows={3}
            className="mt-4 w-full resize-none rounded-2xl border border-[var(--border-light)] bg-[var(--input)] p-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-primary)]"
          />

          <PrimaryButton
            className="mt-4"
            variant="danger"
            disabled={!reason || submitting}
            loading={submitting}
            onClick={() => reason && onSubmit(reason, details)}
          >
            Submit Flag
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
