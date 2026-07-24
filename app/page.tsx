import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Mic, Sparkles, Globe, Trophy, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

/**
 * Public welcome / landing page. Web port of WelcomeScreen. Redirects
 * signed-in users straight to the feed.
 */
const FEATURES = [
  { icon: Mic, title: "Share Your Voice", desc: "Record phrases and stories in your language." },
  { icon: Sparkles, title: "Create AI Stories", desc: "Turn your words into visual storytelling." },
  { icon: Globe, title: "Preserve Culture", desc: "Help keep underrepresented languages alive." },
  { icon: Trophy, title: "Earn & Learn", desc: "Get rewarded as you contribute and validate." },
];

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/feed");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 py-12">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[var(--input)]">
        <Mic className="h-11 w-11 text-[var(--color-primary)]" />
        <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>

      <h1 className="text-center text-3xl font-extrabold tracking-tight">
        <span className="text-brand-gradient">LinguaLink</span>
      </h1>
      <p className="mt-2 text-center text-[var(--muted)]">
        Preserving languages, one voice at a time.
      </p>

      <div className="mt-8 w-full space-y-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <GlassCard key={f.title} className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--input)] text-[var(--color-primary)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{f.title}</span>
                  <span className="block text-sm text-[var(--muted)]">
                    {f.desc}
                  </span>
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="mt-8 w-full space-y-3">
        <Link
          href="/sign-up"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient font-semibold text-white shadow-glow transition hover:brightness-105"
        >
          Get Started <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href="/sign-in"
          className="flex h-14 w-full items-center justify-center rounded-full border border-[var(--border-light)] font-semibold text-[var(--foreground)] transition hover:bg-[var(--input)]"
        >
          I Already Have an Account
        </Link>
      </div>
    </main>
  );
}
