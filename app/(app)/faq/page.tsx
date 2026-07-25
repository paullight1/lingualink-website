"use client";

/** FAQ — same questions as the mobile FAQScreen, with contact support. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Mail } from "lucide-react";

import { AppHeader, GlassCard, PrimaryButton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How do I earn XP?",
    a: "Complete lessons, maintain your streak, and participate in challenges.",
  },
  {
    q: "Can I learn multiple languages?",
    a: "Yes! You can switch languages from your profile settings.",
  },
  {
    q: "Is LinguaLink free?",
    a: "The core features are free. Premium features unlock more content.",
  },
  {
    q: "How do I get paid for my recordings?",
    a: "Clips that pass community validation earn rewards, which build up in your wallet. Once you hit the payout threshold you can withdraw from the Wallet screen.",
  },
  {
    q: "Why was my clip rejected?",
    a: "Validators may have found the audio unclear, the wrong language, or a mismatch with the prompt. You can record it again at any time.",
  },
  {
    q: "Does the web app share my mobile account?",
    a: "Yes. It's the same account and the same data — anything you record, save, or earn appears on both.",
  },
];

export default function FaqPage() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-full">
      <AppHeader title="FAQ" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, index) => {
            const isOpen = open === index;
            return (
              <GlassCard key={faq.q} className="overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span className="font-semibold text-[var(--foreground)]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-[var(--muted)] transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm leading-relaxed text-[var(--muted)]">
                    {faq.a}
                  </p>
                )}
              </GlassCard>
            );
          })}
        </div>

        <PrimaryButton
          className="mt-6"
          leftIcon={<Mail className="h-5 w-5" />}
          onClick={() => {
            window.location.href = "mailto:info@lingualink.com";
          }}
        >
          Contact Support
        </PrimaryButton>
      </PageContainer>
    </div>
  );
}
