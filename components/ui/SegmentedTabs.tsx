"use client";

import { cn } from "@/lib/utils";

/**
 * Segmented tab bar with an active orange indicator. Used by feed, profile,
 * library, leaderboard. Controlled component.
 */
export interface SegmentedTab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedTabsProps {
  tabs: SegmentedTab[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export function SegmentedTabs({
  tabs,
  value,
  onChange,
  className,
  variant = "underline",
}: SegmentedTabsProps) {
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "no-scrollbar flex gap-2 overflow-x-auto rounded-full bg-[var(--input)] p-1",
          className
        )}
      >
        {tabs.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-gradient text-white shadow-glow"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "no-scrollbar flex gap-6 overflow-x-auto border-b border-[var(--border-light)]",
        className
      )}
    >
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={cn(
              "relative flex items-center gap-1.5 whitespace-nowrap pb-3 pt-1 text-sm font-semibold transition-colors",
              active
                ? "text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {t.icon}
            {t.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-gradient" />
            )}
          </button>
        );
      })}
    </div>
  );
}
