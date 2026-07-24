// Global loading state for the authenticated (app) route group — shown while any route segment streams in.
import { Spinner } from "@/components/ui";

export default function AppLoading() {
  return (
    <div className="flex min-h-[60dvh] w-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <Spinner />
      <p className="text-sm font-medium text-[var(--muted)]">Loading LinguaLink…</p>
    </div>
  );
}
