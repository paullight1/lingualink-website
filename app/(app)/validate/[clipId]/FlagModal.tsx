"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Field, ModalSheet, PrimaryButton, Textarea } from "@/components/ui";
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
    <ModalSheet
      onClose={onClose}
      title="Flag for review"
      description="Let an admin know there's an issue with this clip."
      size="md"
      footer={
        <PrimaryButton
          variant="danger"
          disabled={!reason || submitting}
          loading={submitting}
          onClick={() => reason && onSubmit(reason, details)}
        >
          Submit Flag
        </PrimaryButton>
      }
    >
      <div role="radiogroup" aria-label="Reason" className="flex flex-col gap-2">
        {FLAG_REASONS.map((r) => {
          const selected = reason === r.id;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setReason(r.id)}
              className={cn(
                "flex items-center gap-3 rounded-[16px] border px-4 py-3 text-left transition",
                selected
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--field-border)] bg-[var(--field-bg)] hover:border-[var(--field-border-hover)]"
              )}
            >
              <span
                className={cn(
                  "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition",
                  selected
                    ? "border-[var(--color-primary)]"
                    : "border-[var(--muted-2)]"
                )}
              >
                {selected && (
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                )}
              </span>
              <span
                className={cn(
                  "text-[14px] font-semibold",
                  selected
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--foreground)]"
                )}
              >
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      <Field label="Additional notes" optional className="mt-4">
        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Anything an admin should know?"
          rows={3}
        />
      </Field>
    </ModalSheet>
  );
}
