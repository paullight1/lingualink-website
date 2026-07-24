"use client";

import { useState } from "react";
import { X, Megaphone, AlertTriangle, EyeOff, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { PrimaryButton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { submitReport, REPORT_REASONS, type ReportReason } from "@/lib/api/moderation";

/**
 * Report a user or post to moderation. Web port of the mobile ReportModal —
 * same reasons, same copy, same POST /moderation/report payload.
 */

const REASON_ICONS: Record<ReportReason, React.ComponentType<{ className?: string }>> = {
  spam: Megaphone,
  harassment: AlertTriangle,
  inappropriate: EyeOff,
  other: MoreHorizontal,
};

export interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  /** Author being reported — the backend keys reports on the user. */
  reportedUserId: string;
  /** Optional post the report is about. */
  postId?: string;
  /** Shown in the header, e.g. "Report post". */
  title?: string;
}

export function ReportModal({
  open,
  onClose,
  reportedUserId,
  postId,
  title = "Report",
}: ReportModalProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const close = () => {
    setReason(null);
    setDetails("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason || submitting) return;
    setSubmitting(true);
    try {
      await submitReport({
        reportedUserId,
        postId,
        reason,
        additionalDetails: details.trim() || undefined,
      });
      toast.success("Report submitted. Our team will review it.");
      close();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't submit the report"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={close}
      role="presentation"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] border border-[var(--border-light)] bg-[var(--card)] sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-4 text-sm text-[var(--muted)]">
            Why are you reporting this? Reports are anonymous.
          </p>

          <div className="flex flex-col gap-2">
            {REPORT_REASONS.map((option) => {
              const Icon = REASON_ICONS[option.value];
              const selected = reason === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setReason(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
                    selected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-transparent bg-[var(--input)] hover:border-[var(--border-light)]"
                  )}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface)]">
                    <Icon className="h-4 w-4 text-[var(--muted)]" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        selected
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--foreground)]"
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)"
            rows={3}
            className="mt-4 w-full resize-none rounded-2xl border border-[var(--border-light)] bg-[var(--input)] p-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-primary)]"
          />

          <PrimaryButton
            className="mt-4"
            variant="danger"
            disabled={!reason || submitting}
            loading={submitting}
            onClick={handleSubmit}
          >
            Submit Report
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
