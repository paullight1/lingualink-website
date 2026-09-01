import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle,
  GlobeHemisphereWest,
  Heart,
  Microphone,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { appUrl } from "@/lib/site-urls";

export const metadata: Metadata = {
  title: "About LinguaLink",
  description:
    "Learn why LinguaLink is building a more inclusive voice future for African languages.",
};

const principles = [
  {
    icon: GlobeHemisphereWest,
    title: "Every language matters",
    text: "A language carries memory, humour, knowledge, and belonging. We build tools that help it stay visible.",
    tone: "bg-orange-50 text-orange-600",
  },
  {
    icon: Heart,
    title: "Speakers deserve value",
    text: "The people who contribute language data should understand its value and share in what it creates.",
    tone: "bg-purple-50 text-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Trust is the foundation",
    text: "Community review, clear rules, and privacy keep every recording useful and respectful.",
    tone: "bg-emerald-50 text-emerald-600",
  },
];

const commitments = [
  "Simple tools for everyday phones",
  "Community-led language validation",
  "Clear ownership and privacy choices",
  "Fair rewards for useful contributions",
];

function AboutIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-orange-200 via-amber-50 to-purple-200 blur-2xl" />
      <div className="absolute inset-10 rounded-[3rem] border-2 border-orange-200 bg-white/80 shadow-xl" />
      <div className="absolute inset-20 flex items-center justify-center rounded-full bg-[#FFF8F0] text-[#FF8201] shadow-inner">
        <GlobeHemisphereWest aria-hidden="true" size={150} weight="duotone" />
      </div>
      <div className="absolute left-0 top-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-xl">
        <Microphone aria-hidden="true" className="text-orange-600" size={21} weight="duotone" />
        Your voice
      </div>
      <div className="absolute bottom-16 right-0 flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-xl">
        <UsersThree aria-hidden="true" className="text-orange-300" size={21} weight="duotone" />
        Our community
      </div>
      <div className="absolute right-8 top-4 h-12 w-12 rounded-full bg-purple-200" />
      <div className="absolute bottom-8 left-10 h-8 w-8 rounded-full bg-orange-300" />
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-[#F5F1E8] text-gray-800">
      <section className="relative overflow-hidden px-6 pb-20 pt-32 lg:px-8 lg:pb-28">
        <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#FF8201]">
              About LinguaLink
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.98] tracking-[-0.05em] text-gray-900 sm:text-6xl">
              Language belongs in the future.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-gray-600 sm:text-xl">
              LinguaLink helps people record, protect, and grow the languages technology has overlooked.
            </p>
            <a
              href={appUrl + "/sign-up"}
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF8201] to-[#FF6B00] px-7 py-4 font-bold text-white shadow-xl shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-2xl"
            >
              Get Started
              <ArrowRight aria-hidden="true" size={19} weight="bold" />
            </a>
          </div>
          <AboutIllustration />
        </div>
      </section>

      <section className="bg-white px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#FF8201]">Our Story</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Built to listen.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-gray-600">
            <p>
              Africa is home to thousands of languages, but most digital products were never taught to understand them.
            </p>
            <p>
              We started LinguaLink in Nigeria with a simple belief: the people who speak a language every day are the experts. Give them a useful tool, treat their contributions with respect, and better technology can follow.
            </p>
            <p>
              Today, LinguaLink brings recording, community review, communication, and rewards into one place.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F1E8] px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#FF8201]">What We Believe</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              The work starts with people.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <article key={principle.title} className="rounded-3xl border border-orange-100 bg-white p-7 shadow-sm">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${principle.tone}`}>
                    <Icon aria-hidden="true" size={28} weight="duotone" />
                  </div>
                  <h3 className="mt-7 text-xl font-black text-gray-900">{principle.title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{principle.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#FF8201]">Our Mission</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Make every language count.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              We are building the voice infrastructure that lets communities shape how technology understands them.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {commitments.map((commitment) => (
                <div key={commitment} className="flex items-start gap-3 text-sm font-semibold text-gray-700">
                  <CheckCircle aria-hidden="true" className="mt-0.5 shrink-0 text-orange-500" size={20} weight="fill" />
                  {commitment}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] bg-gray-900 p-8 text-white shadow-xl sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-orange-300">Data Dignity</p>
            <h3 className="mt-5 text-3xl font-black tracking-tight">Your voice stays yours.</h3>
            <p className="mt-5 leading-relaxed text-white/70">
              We keep privacy and clear ownership at the centre of every recording, review, and reward.
            </p>
            <a href="/privacy" className="mt-8 inline-flex items-center gap-2 font-bold text-orange-300 transition hover:text-white">
              Read our privacy policy
              <ArrowRight aria-hidden="true" size={17} weight="bold" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#FF8201] to-[#FF6B00] px-6 py-20 text-center text-white lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-white/75">Join the community</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Start with one phrase.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            Help keep your language in the conversation.
          </p>
          <a href={appUrl + "/sign-up"} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-orange-600 shadow-xl transition hover:-translate-y-0.5">
            Get Started
            <ArrowRight aria-hidden="true" size={18} weight="bold" />
          </a>
        </div>
      </section>
    </div>
  );
}
