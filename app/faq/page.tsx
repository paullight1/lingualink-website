import type { Metadata } from "next";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/site/Reveal";
import { DarkCta } from "@/components/site/DarkCta";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about recording, validation, payments and privacy on LinguaLink.",
};

const groups: { title: string; items: { q: string; a: string }[] }[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "What is LinguaLink?",
        a: "LinguaLink is a free app that pays you to record short phrases in your language. The recordings help build voice technology for African languages, so phones and apps can finally understand them.",
      },
      {
        q: "Which languages can I record in?",
        a: "Right now the app supports Yoruba, Igbo and Hausa, with dialects welcome. More languages are coming. If you want yours added, tell us through the contact page.",
      },
      {
        q: "Do I need a special phone or microphone?",
        a: "No. Any Android or iOS phone with a working microphone is enough. The app is built to run well on low-cost phones and small data bundles.",
      },
      {
        q: "Does it work without internet?",
        a: "Yes. You can record offline, and your clips upload on their own when you are back online. A typical session uses less than 2MB of data.",
      },
    ],
  },
  {
    title: "Recording and checking",
    items: [
      {
        q: "What do I actually record?",
        a: "Short, everyday phrases: greetings, numbers, family words, time and dates, market talk. Each one takes about ten seconds. The app guides you from simple phrases to harder ones as you go.",
      },
      {
        q: "What is validation?",
        a: "Validation means listening to clips from other speakers and confirming they sound right. It keeps the collection clean and correct, and you earn points for every clip you check.",
      },
      {
        q: "Why was my recording rejected?",
        a: "The usual reasons are background noise, the wrong phrase, or a clip that is too short or too long. Find a quiet spot, read the phrase once before recording, and speak at your normal pace. You can always try again.",
      },
      {
        q: "Can I record my dialect?",
        a: "Please do. Dialects are exactly what makes a language rich. The app tags your dialect and region so your way of speaking is counted, not corrected.",
      },
    ],
  },
  {
    title: "Money",
    items: [
      {
        q: "How much can I earn?",
        a: "You earn points for every approved recording and every clip you validate. Daily streaks multiply your points. What you earn depends on how much you contribute; steady daily use adds up fastest.",
      },
      {
        q: "How do I get my money?",
        a: "Your balance is always visible in the app. When you are ready, request a withdrawal to your bank account or mobile wallet. There are no hidden fees.",
      },
      {
        q: "Is there a minimum withdrawal?",
        a: "Yes, there is a small minimum so transfer fees do not eat your earnings. You can see the current minimum on the withdrawal screen in the app.",
      },
      {
        q: "Do referrals earn anything?",
        a: "Yes. Share your referral code, and when a friend joins and starts contributing, you both earn a bonus.",
      },
    ],
  },
  {
    title: "Privacy and data",
    items: [
      {
        q: "What happens to my recordings?",
        a: "Software checks the audio quality, fellow speakers confirm it sounds right, and approved clips join a validated speech collection for your language. That collection helps researchers and builders teach technology to understand African languages.",
      },
      {
        q: "Is my personal information sold?",
        a: "No. Your voice clips are separated from your name and contact details, and we do not sell your personal information. Our privacy policy explains this in plain language.",
      },
      {
        q: "Can someone clone my voice from my clips?",
        a: "Clips are short phrases, not long speeches, and using anyone's recordings to imitate them is against our rules. We block that use in our agreements with partners.",
      },
      {
        q: "Can I delete my account and data?",
        a: "Yes. You can request deletion inside the app or by writing to us. We remove your profile and personal details, and we tell you clearly what happens to already-validated clips.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line bg-tint">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
          <Reveal>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Questions, answered.
            </h1>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
              Everything people ask us most, in plain words. If your question
              is missing, <Link href="/contact" className="font-semibold text-brand-text underline underline-offset-2">write to us</Link> and a real person will reply.
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
          {groups.map((group, gi) => (
            <Reveal key={group.title} delay={gi * 0.05}>
              <div className={gi > 0 ? "mt-14" : ""}>
                <h2 className="text-2xl font-extrabold tracking-tight">
                  {group.title}
                </h2>
                <div className="mt-6 divide-y divide-line border-y border-line">
                  {group.items.map((item) => (
                    <details key={item.q} className="group py-1">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold">
                        {item.q}
                        <CaretDown
                          size={18}
                          aria-hidden="true"
                          className="faq-chevron shrink-0 text-brand-deep transition-transform"
                        />
                      </summary>
                      <p className="max-w-[62ch] pb-5 text-[16px] leading-relaxed text-ink-soft">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <DarkCta />
    </>
  );
}
