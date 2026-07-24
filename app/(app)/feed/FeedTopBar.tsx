"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Wordmark + expanding inline search + notifications link + manual refresh. */
export function FeedTopBar({
  searchQuery,
  onSearchChange,
  onRefresh,
  refreshing,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const closeSearch = () => {
    setExpanded(false);
    onSearchChange("");
  };

  return (
    <div className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-[var(--border-light)] bg-[var(--background)]/90 px-4 backdrop-blur-md">
      {expanded ? (
        <div className="flex flex-1 items-center gap-2 rounded-full bg-[var(--input)] px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search phrases, people..."
            className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
          />
          <button
            onClick={closeSearch}
            aria-label="Close search"
            className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate text-xl font-extrabold tracking-tight text-brand-gradient">
            LinguaLink
          </span>
          <button
            onClick={onRefresh}
            aria-label="Refresh"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--input)]"
          >
            <RefreshCw className={cn("h-5 w-5", refreshing && "animate-spin")} />
          </button>
          <button
            onClick={() => setExpanded(true)}
            aria-label="Search"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--input)]"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--foreground)] hover:bg-[var(--input)]"
          >
            <Bell className="h-5 w-5" />
          </Link>
        </>
      )}
    </div>
  );
}
