"use client";

/** Built by Agent 3: 4-slide onboarding carousel (Share Your Voice / Create AI Stories /
 * Preserve Culture / Earn & Learn) shown once to newly-signed-up users. */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { GlassCard, PrimaryButton, StepProgress } from "@/components/ui";
import { Spinner } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { ONBOARDING_SLIDES, ONBOARDING_STORAGE_KEY } from "./slides";

const NEXT_ROUTE = "/profile-setup";

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -48 : 48,
    opacity: 0,
  }),
};

/** Splits a title on `highlight` and wraps that word in the brand gradient. */
function renderTitle(title: string, highlight: string) {
  const idx = title.indexOf(highlight);
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-brand-gradient">{highlight}</span>
      {title.slice(idx + highlight.length)}
    </>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const total = ONBOARDING_SLIDES.length;
  const isLast = step === total - 1;
  const slide = ONBOARDING_SLIDES[step];

  // If the user already finished/skipped onboarding before, don't show it again.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
    } catch {
      // localStorage unavailable (private mode, SSR edge case) — just show the carousel.
    }
    if (seen) {
      router.replace(NEXT_ROUTE);
    } else {
      setReady(true);
    }
  }, [router]);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // ignore write failures — worst case the carousel shows again next time
    }
    router.push(NEXT_ROUTE);
  }, [router]);

  const handleNext = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    setDirection(1);
    setStep((s) => Math.min(s + 1, total - 1));
  }, [isLast, finish, total]);

  const handleDotClick = useCallback(
    (i: number) => {
      if (i === step) return;
      setDirection(i > step ? 1 : -1);
      setStep(i);
    },
    [step]
  );

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const Icon = slide.icon;

  return (
    <div className="flex flex-col gap-8">
      {/* Progress + skip */}
      <StepProgress
        step={step + 1}
        total={total}
        action={
          <button
            type="button"
            onClick={finish}
            className="shrink-0 rounded-full px-2 py-1 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Skip
          </button>
        }
      />

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8"
        >
          {/* Glowing icon circle */}
          <div className="relative flex h-32 w-32 items-center justify-center">
            <motion.div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ backgroundColor: slide.accent, opacity: 0.35 }}
              animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${slide.accent} 0%, ${slide.accent}cc 100%)`,
                boxShadow: `0 8px 32px ${slide.accent}4d`,
              }}
            >
              <Icon className="h-12 w-12 text-white" strokeWidth={1.75} />
            </div>
          </div>

          <GlassCard className="w-full p-6 text-center sm:p-8">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-[32px]">
              {renderTitle(slide.title, slide.highlight)}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">
              {slide.body}
            </p>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Dot pagination */}
      <div className="flex items-center justify-center gap-2">
        {ONBOARDING_SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === step}
            onClick={() => handleDotClick(i)}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              i === step
                ? "w-8 bg-brand-gradient"
                : "w-2.5 bg-[var(--border-light)] hover:bg-[var(--muted)]"
            )}
          />
        ))}
      </div>

      {/* CTA */}
      <PrimaryButton
        onClick={handleNext}
        rightIcon={
          isLast ? <Rocket className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />
        }
      >
        {isLast ? "Get Started" : "Next"}
      </PrimaryButton>
    </div>
  );
}
