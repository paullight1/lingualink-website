"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Grouped settings section with a caption header. */
export function SettingsSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-6", className)}>
      {title && (
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {title}
        </h2>
      )}
      <div className="overflow-hidden rounded-[16px] border border-[var(--border-light)] bg-[var(--surface)]">
        {children}
      </div>
    </section>
  );
}

/** A single settings row: icon + label (+ optional value / trailing control). */
export function SettingsItem({
  icon,
  label,
  value,
  onClick,
  trailing,
  danger,
  showChevron = true,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
  showChevron?: boolean;
}) {
  const interactive = !!onClick;
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 border-b border-[var(--border-light)] px-4 py-3 last:border-b-0",
        interactive && "cursor-pointer hover:bg-[var(--input)]"
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full bg-[var(--input)]",
            danger ? "text-[var(--error)]" : "text-[var(--color-primary)]"
          )}
        >
          {icon}
        </span>
      )}
      <span
        className={cn(
          "flex-1 text-sm font-medium",
          danger ? "text-[var(--error)]" : "text-[var(--foreground)]"
        )}
      >
        {label}
      </span>
      {value && <span className="text-sm text-[var(--muted)]">{value}</span>}
      {trailing}
      {interactive && showChevron && !trailing && (
        <ChevronRight className="h-4 w-4 text-[var(--muted)]" />
      )}
    </div>
  );
}
