"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Interest } from "./data";

/** One selectable interest tile — emoji, name, colored border, checkmark when selected. */
export function InterestCard({
  interest,
  selected,
  onToggle,
}: {
  interest: Interest;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-[20px] border-[1.5px] px-4 py-4 text-center transition-all active:scale-[0.98]",
        !selected && "bg-[var(--glass-bg)]"
      )}
      style={{
        borderColor: selected ? interest.color : "var(--glass-border)",
        backgroundColor: selected ? `${interest.color}1A` : undefined,
      }}
    >
      <span className="text-2xl leading-none">{interest.icon}</span>
      <span
        className="text-[15px] font-semibold"
        style={{ color: selected ? interest.color : "var(--foreground)" }}
      >
        {interest.name}
      </span>
      {selected && (
        <span
          className="absolute right-2.5 top-2.5 flex h-[22px] w-[22px] items-center justify-center rounded-full shadow-sm"
          style={{ backgroundColor: interest.color }}
        >
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
