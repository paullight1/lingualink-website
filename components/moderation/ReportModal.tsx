"use client";

import { useState } from "react";
import { Megaphone, AlertTriangle, EyeOff, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import { Field, ModalSheet, PrimaryButton, Textarea } from "@/components/ui";
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
    <ModalSheet
      onClose={close}
      title={title}
      description="Why are you reporting this? Reports are anonymous."
      size="md"
      footer={
        <PrimaryButton
          variant="danger"
          disabled={!reason || submitting}
          loading={submitting}
          onClick={handleSubmit}
        >
          Submit Report
        </PrimaryButton>
      }
    >
      <div role="radiogroup" aria-label="Reason" className="flex flex-col gap-2">
            {REPORT_REASONS.map((option) => {
              const Icon = REASON_ICONS[option.value];
              const selected = reason === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  onClick={() => setReason(option.value)}
                  aria-checked={selected}
                  className={cn(
                    "flex items-start gap-3 rounded-[16px] border px-4 py-3 text-left transition",
                    selected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--field-border)] bg-[var(--field-bg)] hover:border-[var(--field-border-hover)]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      selected
                        ? "bg-[var(--color-primary)]/15"
                        : "bg-[var(--surface)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        selected
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--muted)]"
                      )}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-[14px] font-semibold",
                        selected
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--foreground)]"
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-[var(--muted-2)]">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}
      </div>

      <Field label="Additional details" optional className="mt-4">
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Anything else our team should know?"
          rows={3}
        />
      </Field>
    </ModalSheet>
  );
}
