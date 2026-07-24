"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Selectable pill/chip — interests, languages, timeframes. Selected state shows
 * a tinted background, colored border, and optional checkmark.
 */
export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  showCheck?: boolean;
  color?: string; // accent color when selected
  className?: string;
  disabled?: boolean;
}

export function Chip({
  label,
  selected,
  onClick,
  icon,
  showCheck,
  color = "#FF8A00",
  className,
  disabled,
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all disabled:opacity-50",
        selected
          ? "text-[var(--foreground)]"
          : "border-[var(--border-light)] text-[var(--muted)] hover:text-[var(--foreground)]",
        className
      )}
      style={
        selected
          ? { borderColor: color, backgroundColor: `${color}1A` }
          : undefined
      }
    >
      {icon}
      {label}
      {selected && showCheck && (
        <Check className="h-3.5 w-3.5" style={{ color }} />
      )}
    </button>
  );
}
