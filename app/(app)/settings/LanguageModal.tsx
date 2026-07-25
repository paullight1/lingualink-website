"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, Plus } from "lucide-react";
import {
  Input,
  ModalSheet,
  PrimaryButton,
  SearchInput,
  Skeleton,
} from "@/components/ui";
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
    <ModalSheet
      onClose={onClose}
      title="Primary language"
      footer={
        showCustom ? (
          <div className="flex flex-col gap-2.5">
            <Input
              autoFocus
              size="md"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Language name"
              aria-label="Language name"
            />
            <Input
              size="md"
              value={customDialect}
              onChange={(e) => setCustomDialect(e.target.value)}
              placeholder="Dialect (optional)"
              aria-label="Dialect"
            />
            <div className="flex gap-2.5">
              <PrimaryButton
                size="sm"
                variant="outline"
                onClick={() => setShowCustom(false)}
                disabled={saving}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton size="sm" onClick={handleAddCustom} loading={saving}>
                Add &amp; select
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--input)]"
          >
            <Plus className="h-4 w-4" />
            Add a language not listed
          </button>
        )
      }
    >
      <SearchInput
        label="Search languages"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery("")}
        wrapperClassName="mb-3"
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted)]">
          No languages found.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filtered.map((lang) => {
            const label = formatLanguage(lang.name, lang.dialect);
            const active = label === currentValue;
            return (
              <li key={lang.id}>
                <button
                  type="button"
                  onClick={() => handlePick(lang)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-[var(--input)]",
                    active
                      ? "bg-[var(--color-primary)]/10 font-semibold text-[var(--color-primary)]"
                      : "text-[var(--foreground)]"
                  )}
                >
                  <span className="truncate">{label}</span>
                  {active && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </ModalSheet>
  );
}
