"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";

/** Small "..." menu with an inline two-step delete confirmation (no global modal needed). */
export function ManageMenu({
  onDelete,
  deleting,
}: {
  onDelete: () => void;
  deleting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Manage clip"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-10 w-52 rounded-2xl border border-[var(--border-light)] bg-[var(--card)] p-1.5 shadow-lg">
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--error)] transition hover:bg-[var(--input)]"
            >
              <Trash2 className="h-4 w-4" />
              Delete clip
            </button>
          ) : (
            <div className="p-1">
              <p className="mb-2 px-1 text-xs text-[var(--muted)]">
                Delete this clip? This can&apos;t be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirming(false);
                    setOpen(false);
                  }}
                  className="flex-1 rounded-lg border border-[var(--border-light)] px-2 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--input)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    onDelete();
                    setOpen(false);
                    setConfirming(false);
                  }}
                  className="flex-1 rounded-lg bg-[var(--error)] px-2 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
