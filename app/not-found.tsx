// App-wide 404 page — shown when a route doesn't match anything (auth or app group).
import Link from "next/link";
import { Mic, Sparkles, Compass } from "lucide-react";
import { PrimaryButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[var(--input)]">
        <Mic className="h-11 w-11 text-[var(--color-primary)]" />
        <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight">
        <span className="text-brand-gradient">LinguaLink</span>
      </h1>

      <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--input)] text-[var(--muted)]">
        <Compass className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
        Page not found
      </h2>
      <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>

      <Link href="/feed" className="mt-8 w-full">
        <PrimaryButton size="lg">Back to Feed</PrimaryButton>
      </Link>
    </main>
  );
}
