"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-[24px] border border-[var(--border-light)] bg-[var(--card)] sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Select Country
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--input)] px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search countries..."
              className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </div>

        <ul className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-[var(--muted)]">
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
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[var(--input)]",
                    isSelected && "bg-[var(--input)]"
                  )}
                >
                  <span className="text-2xl leading-none">{c.flag}</span>
                  <span className="flex flex-col">
                    <span className="text-[15px] font-semibold text-[var(--foreground)]">
                      {c.name}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
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
