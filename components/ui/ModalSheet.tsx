"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The dialog shell every modal in the app uses: bottom sheet on phones,
 * centred card from `sm` up.
 *
 * It was previously copy-pasted per modal, which drifted into a different
 * radius, padding and header size in each one, and none of the copies closed on
 * Escape or stopped the page behind from scrolling. This owns all of that.
 */
export interface ModalSheetProps {
  open?: boolean;
  onClose: () => void;
  title: ReactNode;
  /** Secondary line under the title. */
  description?: ReactNode;
  /** Pinned action row at the bottom; stays put while the body scrolls. */
  footer?: ReactNode;
  /** Max width of the centred card. */
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

const WIDTH = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
} as const;

export function ModalSheet({
  open = true,
  onClose,
  title,
  description,
  footer,
  size = "sm",
  children,
  className,
}: ModalSheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog so the keyboard doesn't stay behind it.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "animate-sheet-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-[var(--border-light)] bg-[var(--surface)] shadow-2xl outline-none sm:max-h-[85dvh] sm:rounded-[24px]",
          WIDTH[size],
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="text-[17px] font-bold leading-tight text-[var(--foreground)]"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-1">{children}</div>

        {footer && (
          <div className="safe-bottom border-t border-[var(--border-light)] bg-[var(--surface)] px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
