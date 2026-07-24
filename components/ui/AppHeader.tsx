"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Standard sub-page header: back arrow | centered title | optional right action.
 * Web port of the mobile AppHeader. Sticky under the top bar.
 */
export interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  title,
  onBack,
  showBack = true,
  rightElement,
  className,
}: AppHeaderProps) {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-[var(--border-light)] bg-[var(--surface)]/80 px-3 backdrop-blur-md",
        className
      )}
    >
      {showBack ? (
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--input)]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      ) : (
        <span className="w-10" />
      )}
      <h1 className="flex-1 truncate text-center text-base font-semibold">
        {title}
      </h1>
      <div className="flex min-w-10 items-center justify-end">
        {rightElement}
      </div>
    </header>
  );
}
