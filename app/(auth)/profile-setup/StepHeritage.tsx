"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Chip } from "@/components/ui";
import { CountryModal } from "./CountryModal";
import { COUNTRIES, type Country, type Language } from "./country-data";

/** Step 1 — pick a heritage country, then multi-select the languages spoken there. */
export function StepHeritage({
  country,
  onCountryChange,
  languages,
  onLanguagesChange,
}: {
  country: Country | null;
  onCountryChange: (c: Country) => void;
  languages: Language[];
  onLanguagesChange: (langs: Language[]) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [customLang, setCustomLang] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const toggleLang = (lang: Language) => {
    const exists = languages.some((l) => l.name === lang.name);
    onLanguagesChange(
      exists
        ? languages.filter((l) => l.name !== lang.name)
        : [...languages, lang]
    );
  };

  const addCustomLang = () => {
    const name = customLang.trim();
    if (!name) return;
    if (!languages.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
      onLanguagesChange([
        ...languages,
        { name, code: `custom_${Date.now()}` },
      ]);
    }
    setCustomLang("");
    setShowCustomInput(false);
  };

  return (
    <div>
      <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-[34px]">
        Your <span className="text-[var(--color-primary)]">Heritage</span>
      </h1>
      <p className="mb-8 mt-2 text-base text-[var(--muted)]">
        Where are you from?
      </p>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold tracking-wide text-[var(--muted)]">
            Country
          </label>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition"
            style={
              country
                ? {
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(255,138,0,0.1)",
                  }
                : { borderColor: "var(--border-light)" }
            }
          >
            {country ? (
              <span className="flex items-center gap-3">
                <span className="text-2xl leading-none">{country.flag}</span>
                <span className="font-semibold text-[var(--foreground)]">
                  {country.name}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2 text-[var(--color-primary)]">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Select Country</span>
              </span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)]" />
          </button>
        </div>

        {country && (
          <div>
            <label className="mb-2 block text-sm font-semibold tracking-wide text-[var(--muted)]">
              Languages you speak
            </label>
            <div className="flex flex-wrap gap-2.5">
              {country.languages.map((lang) => (
                <Chip
                  key={lang.name}
                  label={lang.name}
                  icon={<span>🗣️</span>}
                  selected={languages.some((l) => l.name === lang.name)}
                  showCheck
                  onClick={() => toggleLang(lang)}
                />
              ))}
              {languages
                .filter(
                  (l) => !country.languages.some((cl) => cl.name === l.name)
                )
                .map((lang) => (
                  <Chip
                    key={lang.name}
                    label={lang.name}
                    icon={<span>🗣️</span>}
                    selected
                    showCheck
                    onClick={() => toggleLang(lang)}
                  />
                ))}

              {showCustomInput ? (
                <div className="flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--input)] pl-3.5 pr-1.5 py-1">
                  <input
                    autoFocus
                    value={customLang}
                    onChange={(e) => setCustomLang(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomLang()}
                    placeholder="Language name"
                    className="w-28 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
                  />
                  <button
                    type="button"
                    onClick={addCustomLang}
                    className="rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <Chip
                  label="Add my language"
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => setShowCustomInput(true)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <CountryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        countries={COUNTRIES}
        selected={country}
        onSelect={(c) => {
          onCountryChange(c);
          onLanguagesChange([]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
