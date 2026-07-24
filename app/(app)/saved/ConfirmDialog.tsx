"use client";

import { PrimaryButton } from "@/components/ui";

/** Small centered confirm modal, colocated for the Saved Items "clear all" flow. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  loading,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[24px] border border-[var(--border-light)] bg-[var(--surface)] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>
        <div className="mt-6 flex gap-3">
          <PrimaryButton
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </PrimaryButton>
          <PrimaryButton
            variant="danger"
            size="md"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
