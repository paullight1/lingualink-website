"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { SearchInput } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Country } from "./country-data";

/** Searchable full-screen modal for picking a country (with flag). */
export function CountryModal({
  open,
  onClose,
  countries,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  countries: Country[];
  selected: Country | null;
  onSelect: (country: Country) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, query]);

  // Esc closes, and the page behind must not scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select country"
        className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] border border-[var(--border-light)] bg-[var(--card)] shadow-2xl sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="text-[17px] font-bold text-[var(--foreground)]">
            Select Country
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <SearchInput
            autoFocus
            label="Search countries"
            placeholder="Search countries…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
          />
        </div>

        <ul className="mt-3 flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              No countries match “{query}”.
            </li>
          )}
          {filtered.map((c) => {
            const isSelected = selected?.code === c.code;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => onSelect(c)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-[var(--input)]",
                    isSelected && "bg-[var(--color-primary)]/10"
                  )}
                >
                  <span className="text-2xl leading-none">{c.flag}</span>
                  <span className="flex min-w-0 flex-col">
                    <span
                      className={cn(
                        "truncate text-[15px] font-semibold",
                        isSelected
                          ? "text-[var(--color-primary)]"
                          : "text-[var(--foreground)]"
                      )}
                    >
                      {c.name}
                    </span>
                    <span className="text-[12px] text-[var(--muted-2)]">
                      {c.languages.length} languages
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
