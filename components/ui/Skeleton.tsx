import { cn } from "@/lib/utils";

/** Shimmer placeholder. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--input)]",
        className
      )}
    />
  );
}

/** A spinner for inline loading (mirrors the mobile NewtonCradleLoader intent). */
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-10", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-light)] border-t-[var(--color-primary)]" />
    </div>
  );
}
