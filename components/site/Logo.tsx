import Link from "next/link";

/* Simple geometric mark: an orange rounded tile with three sound bars. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ll-g" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#FF8A00" />
          <stop offset="1" stopColor="#FF5F00" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#ll-g)" />
      <rect x="8" y="12" width="3.5" height="8" rx="1.75" fill="#fff" />
      <rect x="14.25" y="8" width="3.5" height="16" rx="1.75" fill="#fff" />
      <rect x="20.5" y="12" width="3.5" height="8" rx="1.75" fill="#fff" />
    </svg>
  );
}

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5"
      aria-label="LinguaLink home"
    >
      <LogoMark />
      <span
        className={`text-[19px] font-bold tracking-tight ${
          inverted ? "text-white" : "text-ink"
        }`}
      >
        LinguaLink
      </span>
    </Link>
  );
}
