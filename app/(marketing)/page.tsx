import {
  ArrowRight,
  GlobeHemisphereWest,
  Microphone,
  Sparkle,
  Trophy,
  VideoCamera,
} from "@phosphor-icons/react/dist/ssr";
import { appUrl } from "@/lib/site-urls";

const signUpUrl = `${appUrl}/sign-up`;

const features = [
  {
    icon: Microphone,
    title: "Share your voice",
    description: "Record and share phrases in your native language or dialect.",
  },
  {
    icon: VideoCamera,
    title: "Create AI stories",
    description: "Turn your voice into animated stories and cultural tales.",
  },
  {
    icon: GlobeHemisphereWest,
    title: "Preserve culture",
    description: "Help build the world's largest archive of living languages.",
  },
  {
    icon: Trophy,
    title: "Earn & learn",
    description: "Get rewarded for contributions and discover new languages.",
  },
];

function SoundMark() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] bg-white/20 shadow-[0_24px_60px_rgba(98,30,9,.2)] ring-1 ring-white/25 backdrop-blur-sm">
      <div className="absolute inset-2 rounded-[24px] bg-gradient-to-br from-fuchsia-500/80 via-purple-500/65 to-indigo-500/70" />
      <div className="relative flex items-center gap-1.5" aria-hidden="true">
        <span className="h-7 w-1.5 rounded-full bg-white/90" />
        <span className="h-12 w-1.5 rounded-full bg-white" />
        <span className="h-8 w-1.5 rounded-full bg-white/90" />
      </div>
      <Sparkle className="absolute -right-1 -top-1 text-white" size={19} weight="fill" aria-hidden="true" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#f97316] text-white">
      <section className="relative isolate bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.18),transparent_34%),radial-gradient(circle_at_88%_32%,rgba(168,85,247,.38),transparent_30%),linear-gradient(135deg,#f97316_0%,#f59e0b_47%,#f97316_100%)]">
        <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="rise flex justify-center">
              <SoundMark />
            </div>
            <div className="rise mt-7" style={{ animationDelay: "0.08s" }}>
              <p className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">LinguaLink</p>
              <h1 className="mx-auto mt-5 max-w-[15ch] text-4xl font-bold leading-[1.02] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                Preserving languages, one voice at a time
              </h1>
              <p className="mx-auto mt-5 max-w-[34ch] text-base leading-relaxed text-white/80 sm:text-lg">
                A living space for voices, stories, and the cultures that make every language matter.
              </p>
            </div>

            <div className="rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.16s" }}>
              <a
                href={signUpUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-orange-600 shadow-[0_12px_30px_rgba(128,41,6,.2)] transition-transform hover:-translate-y-0.5 active:scale-[.98]"
              >
                Get Started
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore LinguaLink
              </a>
            </div>
          </div>

          <div id="features" className="mx-auto mt-14 grid max-w-4xl scroll-mt-8 gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rise rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition-transform hover:-translate-y-1"
                  style={{ animationDelay: `${0.2 + index * 0.08}s` }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/15">
                    <Icon size={22} weight="duotone" aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-lg font-bold tracking-tight">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{feature.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-14 flex max-w-4xl flex-col items-center justify-between gap-4 border-t border-white/20 pt-6 text-center text-sm text-white/70 sm:flex-row sm:text-left">
            <p>Join thousands preserving linguistic heritage through voice and stories.</p>
            <a className="font-semibold text-white underline decoration-white/50 underline-offset-4 hover:decoration-white" href={appUrl}>
              Open the web app <ArrowRight className="ml-1 inline-block" size={15} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
