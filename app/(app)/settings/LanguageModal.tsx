"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, Plus, Search, X } from "lucide-react";
import { PrimaryButton, Skeleton } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguages, type LanguageOption } from "./hooks";

function formatLanguage(name: string, dialect?: string | null) {
  return dialect ? `${name} / ${dialect}` : name;
}

/** Primary-language picker sourced from the shared `languages` table. */
export function LanguageModal({
  currentValue,
  onClose,
  onSelect,
}: {
  currentValue: string | null;
  onClose: () => void;
  onSelect: (label: string) => void;
}) {
  const { data: languages, isLoading } = useLanguages();
  const [query, setQuery] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDialect, setCustomDialect] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!languages) return [];
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.dialect ?? "").toLowerCase().includes(q)
    );
  }, [languages, query]);

  const handlePick = (lang: LanguageOption) => {
    onSelect(formatLanguage(lang.name, lang.dialect));
    onClose();
  };

  const handleAddCustom = async () => {
    const name = customName.trim();
    if (!name) {
      toast.error("Enter a language name");
      return;
    }
    setSaving(true);
    try {
      await supabase.from("languages").insert({
        name,
        dialect: customDialect.trim() || null,
      });
      onSelect(formatLanguage(name, customDialect.trim() || null));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add language");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-t-[32px] border border-[var(--border-light)] bg-[var(--surface)] p-6 pb-8 shadow-lg sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Primary Language</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-3 shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages"
            className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--input)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--muted)]">No languages found.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {filtered.map((lang) => {
                const label = formatLanguage(lang.name, lang.dialect);
                const active = label === currentValue;
                return (
                  <li key={lang.id}>
                    <button
                      onClick={() => handlePick(lang)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-[var(--input)]",
                        active ? "text-[var(--color-primary)]" : "text-[var(--foreground)]"
                      )}
                    >
                      <span>{label}</span>
                      {active && <Check className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-3 shrink-0 border-t border-[var(--border-light)] pt-3">
          {showCustom ? (
            <div className="flex flex-col gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Language name"
                className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--input)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
              />
              <input
                value={customDialect}
                onChange={(e) => setCustomDialect(e.target.value)}
                placeholder="Dialect (optional)"
                className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--input)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
              />
              <PrimaryButton size="sm" onClick={handleAddCustom} loading={saving}>
                Add & Select
              </PrimaryButton>
            </div>
          ) : (
            <button
              onClick={() => setShowCustom(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--input)]"
            >
              <Plus className="h-4 w-4" />
              Add a language not listed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
