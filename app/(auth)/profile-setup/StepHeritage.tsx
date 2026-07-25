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
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-[32px]">
        Your <span className="text-brand-gradient">Heritage</span>
      </h1>
      <p className="mb-8 mt-2 text-[15px] leading-snug text-[var(--muted)]">
        Where are you from?
      </p>

      <div className="flex flex-col gap-6">
        <div>
          <label
            id="heritage-country-label"
            className="mb-2 block text-[13px] font-semibold text-[var(--foreground)]"
          >
            Country
          </label>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-labelledby="heritage-country-label"
            aria-haspopup="dialog"
            className={
              "flex h-14 w-full items-center justify-between gap-3 rounded-[16px] border px-4 text-left transition-colors " +
              "hover:border-[var(--field-border-hover)] focus-visible:border-[var(--color-primary)]"
            }
            style={
              country
                ? {
                    borderColor: "var(--color-primary)",
                    backgroundColor: "rgba(255,138,0,0.1)",
                  }
                : {
                    borderColor: "var(--field-border)",
                    backgroundColor: "var(--field-bg)",
                  }
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
            <p className="mb-1 text-[13px] font-semibold text-[var(--foreground)]">
              Languages you speak
            </p>
            <p className="mb-3 text-[12px] text-[var(--muted-2)]">
              Pick as many as apply — you can add your own too.
            </p>
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
                <div className="flex h-10 items-center gap-1.5 rounded-full border border-[var(--field-border)] bg-[var(--field-bg)] py-1 pl-4 pr-1.5 transition-colors focus-within:border-[var(--color-primary)] focus-within:shadow-[0_0_0_4px_var(--field-ring)]">
                  <input
                    autoFocus
                    value={customLang}
                    onChange={(e) => setCustomLang(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomLang();
                      }
                      if (e.key === "Escape") {
                        setCustomLang("");
                        setShowCustomInput(false);
                      }
                    }}
                    onBlur={() => !customLang.trim() && setShowCustomInput(false)}
                    aria-label="Add a language"
                    placeholder="Language name"
                    className="w-32 bg-transparent text-[14px] text-[var(--foreground)] outline-none placeholder:text-[var(--placeholder)]"
                  />
                  <button
                    type="button"
                    onClick={addCustomLang}
                    disabled={!customLang.trim()}
                    className="h-7 shrink-0 rounded-full bg-[var(--color-primary)] px-3 text-[12px] font-bold text-white transition disabled:opacity-40"
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
