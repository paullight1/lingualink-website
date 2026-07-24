"use client";

/** Built by Agent 11 — validation queue index (pick a clip to validate). */

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Globe, ChevronRight, CheckCircle2 } from "lucide-react";
import { AppHeader, WaveformPlayer, EmptyState, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { monetizationApi } from "@/lib/api/monetization";
import { qk } from "@/lib/query/keys";
import { extractOriginalPrompt } from "./utils";

export default function ValidateIndexPage() {
  const { data: queue, isLoading, isError } = useQuery({
    queryKey: qk.validationQueue(),
    queryFn: () => monetizationApi.getValidationQueue(20),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-full">
      <AppHeader title="Validate" showBack={false} />
      <PageContainer size="md">
        <p className="mb-4 text-sm text-[var(--muted)]">
          Listen to voice clips and confirm they match the phrase and dialect.
          Every validation helps build better language data.
        </p>

        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-[16px]" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <EmptyState
            title="Couldn't load the queue"
            message="Something went wrong fetching clips to validate. Pull to refresh or try again shortly."
          />
        )}

        {!isLoading && !isError && (!queue || queue.length === 0) && (
          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8" />}
            title="All caught up!"
            message="There are no clips waiting for validation right now. Check back soon."
          />
        )}

        {!isLoading && !isError && queue && queue.length > 0 && (
          <ul className="flex flex-col gap-3">
            {queue.map((item) => (
              <li
                key={item.id}
                className="rounded-[16px] border border-[var(--border-light)] bg-[var(--card)] p-4 shadow-sm transition hover:border-[var(--color-primary)]/40"
              >
                <Link href={`/validate/${item.id}`} className="block">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--input)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                      <Globe className="h-3.5 w-3.5" />
                      {item.language}
                      {item.dialect ? ` · ${item.dialect}` : ""}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-base font-semibold text-[var(--foreground)]">
                    {extractOriginalPrompt(item.phrase || "—")}
                  </p>
                </Link>

                <div
                  className="mt-3"
                  onClick={(e) => e.stopPropagation()}
                  role="presentation"
                >
                  <WaveformPlayer
                    src={item.audio_url}
                    seed={item.id}
                    compact
                  />
                </div>

                <Link
                  href={`/validate/${item.id}`}
                  className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]"
                >
                  <span>
                    {item.validations_count}{" "}
                    {item.validations_count === 1 ? "validation" : "validations"}{" "}
                    so far
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-primary)]">
                    Validate <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
