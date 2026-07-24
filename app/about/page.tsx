import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import { DarkCta } from "@/components/site/DarkCta";
import aboutHero from "@/public/images/about-hero.jpg";
import aboutPeople from "@/public/images/about-people.jpg";

export const metadata: Metadata = {
  title: "About",
  description:
    "LinguaLink exists so African languages thrive in the digital age. Learn who we are and why we built the app.",
};

const beliefs = [
  {
    title: "Languages are libraries",
    text: "Every language holds songs, jokes, medicine and history. When one goes quiet, all of that goes with it. We think that loss is preventable.",
  },
  {
    title: "Speakers should be paid",
    text: "Big companies build voice technology from data. The people who provide that data deserve a fair share, paid openly and on time.",
  },
  {
    title: "Built for real phones",
    text: "Our users are not on the newest devices. The app runs light, works offline, and respects a small data bundle. That is a feature, not an afterthought.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Full-bleed hero photograph with headline */}
      <section className="relative flex min-h-[62vh] items-end overflow-hidden">
        <Image
          src={aboutHero}
          alt="A busy Lagos street with a yellow danfo bus and skaters holding on"
          priority
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent"
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-40 md:px-8 md:pb-20">
          <Reveal>
            <h1 className="max-w-[16ch] text-4xl font-extrabold leading-[1.05] tracking-tight text-white md:text-6xl">
              We keep African languages loud.
            </h1>
          </Reveal>
        </div>
      </section>

      {/* The story, plain prose */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-5">
              <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight md:text-4xl">
                Why we built LinguaLink
              </h2>
            </Reveal>
            <div className="space-y-6 text-[17px] leading-relaxed text-ink-soft md:col-span-6 md:col-start-7">
              <Reveal>
                <p>
                  Africa is home to about 2,000 languages. Yet when you talk to
                  a phone, a bank line or a voice assistant, almost none of
                  them work. The technology was never taught to listen.
                </p>
              </Reveal>
              <Reveal delay={0.05}>
                <p>
                  LinguaLink started in Nigeria with a simple idea: the people
                  who speak these languages every day are the experts. Give
                  them a simple tool, pay them fairly, and together we can
                  build the voice collections these languages need.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <p>
                  Today our community records and checks thousands of clips in
                  Yoruba, Igbo and Hausa, with more languages on the way. Every
                  clip is checked by fellow speakers, so the collection stays
                  true to how people really talk.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Beliefs: numbered sequence with a reason to be numbered removed; plain trio */}
      <section className="border-y border-line bg-tint">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              What guides us
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-12">
            {beliefs.map((belief, i) => (
              <Reveal
                key={belief.title}
                delay={i * 0.08}
                className={
                  i === 0
                    ? "md:col-span-4"
                    : i === 1
                      ? "md:col-span-4 md:mt-12"
                      : "md:col-span-4 md:mt-24"
                }
              >
                <div className="border-t-2 border-brand pt-5">
                  <h3 className="text-xl font-bold tracking-tight">
                    {belief.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-ink-soft">
                    {belief.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Data dignity split */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <Reveal>
            <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight md:text-4xl">
              Your voice stays yours.
            </h2>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft">
              We separate your recordings from your personal details. We never
              sell your contact information, and we never let anyone use your
              clips to copy your voice. If our rules ever change, you hear it
              from us first, inside the app.
            </p>
            <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-ink-soft">
              We wrote our privacy policy in plain language, because a policy
              you cannot read is not really a policy.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Image
              src={aboutPeople}
              alt="A family playing a board game together at home"
              sizes="(min-width: 768px) 520px, 90vw"
              className="rounded-card object-cover"
            />
          </Reveal>
        </div>
      </section>

      <DarkCta />
    </>
  );
}
