import {
  BR,
  CD,
  CM,
  CN,
  GB,
  GH,
  ID,
  IN,
  JP,
  KE,
  MX,
  NG,
  PH,
  US,
  VN,
  ZA,
} from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";

/**
 * Real SVG flags instead of emoji.
 *
 * Regional-indicator flag emoji (🇳🇬) have no glyphs in any font Windows ships,
 * so Chrome and Edge on Windows fall back to rendering the bare letter pair
 * ("NG") — every Windows visitor saw text where a flag belonged.
 *
 * Only the countries in COUNTRIES are imported by name; importing the whole
 * `3x2` barrel would pull ~250 unused flags into the bundle.
 */
const FLAGS: Record<
  string,
  React.ComponentType<{ title?: string; className?: string }>
> = { BR, CD, CM, CN, GB, GH, ID, IN, JP, KE, MX, NG, PH, US, VN, ZA };

export function CountryFlag({
  code,
  name,
  className,
}: {
  /** ISO 3166-1 alpha-2. */
  code: string;
  /** Used as the SVG's accessible title. */
  name: string;
  className?: string;
}) {
  const Flag = FLAGS[code.toUpperCase()];

  // A country without a bundled flag still needs to occupy the same box.
  if (!Flag) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex w-7 shrink-0 items-center justify-center rounded-[3px] bg-[var(--input)] py-1 text-[10px] font-bold text-[var(--muted)]",
          className
        )}
      >
        {code.toUpperCase()}
      </span>
    );
  }

  return (
    <Flag
      title={name}
      // The hairline ring keeps mostly-white flags (JP, IN) from dissolving
      // into a light background.
      className={cn(
        "w-7 shrink-0 rounded-[3px] ring-1 ring-black/10 dark:ring-white/15",
        className
      )}
    />
  );
}
