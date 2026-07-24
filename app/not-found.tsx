import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8">
        <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl">
          Page not found.
        </h1>
        <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-ink-soft">
          This page moved or never existed. The home page has everything you
          need.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-gradient-to-br from-brand to-brand-deep px-8 py-4 text-[17px] font-bold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
