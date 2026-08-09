import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  Headphones,
  Microphone,
  Sparkle,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import heroImg from "@/public/images/hero.jpg";
import recordImg from "@/public/images/record.jpg";

const appUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "http://localhost:3000";

const authLinks = {
  signUp: `${appUrl}/sign-up`,
  signIn: `${appUrl}/sign-in`,
};

function Waveform() {
  const bars = [18, 34, 26, 46, 30, 58, 40, 24, 52, 32, 20, 42, 28, 50, 36, 22];

  return (
    <div className="flex h-14 items-center gap-1" aria-label="Audio waveform">
      {bars.map((height, index) => (
        <span
          key={index}
          className="w-1.5 rounded-full bg-brand transition-transform duration-300 group-hover:scale-y-125"
          style={{ height }}
        />
      ))}
    </div>
  );
}

function ConnectionIllustration() {
  return (
    <svg viewBox="0 0 520 340" className="h-full w-full" role="img" aria-label="A connected language community">
      <defs>
        <linearGradient id="connection-line" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff8a00" />
          <stop offset="1" stopColor="#ffe0b8" />
        </linearGradient>
      </defs>
      <path d="M100 208C151 94 231 96 266 170S384 251 431 114" fill="none" stroke="url(#connection-line)" strokeWidth="3" strokeDasharray="8 11" />
      <path d="M89 220C172 278 239 236 266 170S370 72 438 104" fill="none" stroke="#ff8a00" strokeOpacity=".35" strokeWidth="2" />
      <g className="illustration-float illustration-float-one">
        <circle cx="86" cy="218" r="31" fill="#ff8a00" />
        <circle cx="86" cy="208" r="12" fill="#fff6ec" />
        <path d="M65 243c7-15 35-15 42 0" fill="#fff6ec" />
      </g>
      <g className="illustration-float illustration-float-two">
        <circle cx="266" cy="170" r="44" fill="#221b14" />
        <circle cx="266" cy="157" r="15" fill="#ffcf98" />
        <path d="M238 202c9-22 47-22 56 0" fill="#ffcf98" />
        <path d="M244 142c7-18 37-19 45 0" fill="none" stroke="#ff8a00" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g className="illustration-float illustration-float-three">
        <circle cx="433" cy="105" r="29" fill="#fff6ec" stroke="#ff8a00" strokeWidth="3" />
        <circle cx="433" cy="97" r="11" fill="#ffb35e" />
        <path d="M416 128c7-14 27-14 34 0" fill="#ffb35e" />
      </g>
      <g fill="#221b14">
        <rect x="34" y="65" width="98" height="34" rx="17" />
        <rect x="365" y="225" width="120" height="34" rx="17" />
      </g>
      <g fill="#fff6ec" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700">
        <text x="55" y="87">Kedu?</text>
        <text x="385" y="247">How far?</text>
      </g>
      <g fill="#ff8a00">
        <circle cx="174" cy="68" r="5" />
        <circle cx="355" cy="287" r="8" />
        <circle cx="475" cy="55" r="4" />
      </g>
    </svg>
  );
}

const benefits = [
  { icon: Microphone, title: "Record your voice", text: "Capture everyday phrases in the language you know best." },
  { icon: UsersThree, title: "Strengthen the network", text: "Your words help language technology understand more communities." },
  { icon: Wallet, title: "Earn for your contribution", text: "Collect points and get rewarded for useful, authentic recordings." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-tint">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 md:grid-cols-12 md:px-8 md:pb-24 md:pt-20">
          <div className="relative z-10 md:col-span-6">
            <div className="rise">
              <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.18em] text-brand-text">Voice data for living languages</p>
              <h1 className="max-w-[10ch] text-[clamp(3.5rem,7vw,6.5rem)] font-extrabold leading-[.88] tracking-[-0.07em] text-ink">Your voice belongs in the future.</h1>
            </div>
            <div className="rise" style={{ animationDelay: "0.1s" }}>
              <p className="mt-7 max-w-[38ch] text-lg leading-relaxed text-ink-soft">LinguaLink turns everyday speech in African languages into useful voice data—and puts value back in the hands of the people who speak it.</p>
            </div>
            <div className="rise" style={{ animationDelay: "0.2s" }}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href={authLinks.signUp} className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-[16px] font-bold text-ink transition-transform hover:-translate-y-0.5 active:scale-[.98]">Join LinguaLink <ArrowUpRight size={19} weight="bold" aria-hidden="true" /></a>
                <a href={authLinks.signIn} className="text-[16px] font-semibold text-ink underline decoration-brand underline-offset-4 transition-colors hover:text-brand-text">I already have an account</a>
              </div>
            </div>
          </div>
          <div className="relative md:col-span-6 md:pl-8">
            <div className="absolute -right-10 -top-8 h-40 w-40 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto max-w-[470px]">
              <Image src={heroImg} alt="A woman laughing with her city behind her at dusk" priority sizes="(min-width: 768px) 470px, 90vw" className="relative aspect-[4/5] rounded-[28px] object-cover shadow-[0_28px_80px_rgba(89,49,16,.18)]" />
              <div className="absolute -bottom-6 -left-5 w-[min(290px,76%)] rounded-2xl bg-white p-4 shadow-[0_18px_44px_rgba(89,49,16,.16)] sm:-left-9">
                <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-ink"><Microphone size={18} weight="fill" aria-hidden="true" /></span><div><p className="text-[13px] font-semibold text-ink">Recording in Yoruba</p><p className="text-[12px] text-ink-soft">01:08 · ready to upload</p></div></div><span className="h-2 w-2 rounded-full bg-green-500" aria-label="Ready" /></div>
                <div className="group mt-3 flex items-center gap-3 rounded-xl bg-tint px-3 py-2"><Waveform /><span className="text-[12px] font-semibold text-brand-text">Play</span></div>
              </div>
              <div className="absolute -right-5 top-8 hidden rounded-2xl bg-ink px-4 py-3 text-white shadow-xl sm:block"><p className="text-[11px] uppercase tracking-[.14em] text-night-soft">Contribution</p><p className="mt-1 text-xl font-bold">+240 pts</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-12 md:items-center md:px-8"><p className="md:col-span-4 text-sm font-semibold text-ink-soft">Built for the languages technology often overlooks.</p><div className="flex flex-wrap gap-x-8 gap-y-3 text-lg font-bold tracking-tight text-ink md:col-span-8 md:justify-end"><span>Yorùbá</span><span>Igbo</span><span>Hausa</span><span>Pidgin</span><span>Efik</span><span>Urhobo</span></div></div></section>

      <section id="how" className="scroll-mt-20"><div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28"><div className="grid items-end gap-10 md:grid-cols-12"><div className="md:col-span-6"><h2 className="max-w-[12ch] text-4xl font-extrabold leading-[.96] tracking-[-.05em] md:text-6xl">Simple to do. Meaningful to keep.</h2></div><div className="md:col-span-5 md:col-start-8"><p className="max-w-[36ch] text-[17px] leading-relaxed text-ink-soft">One short recording can add a phrase, a voice, and a little more visibility to a language that deserves to be heard.</p></div></div><div className="mt-14 grid gap-10 border-t border-line pt-8 md:grid-cols-3 md:gap-8">{benefits.map((benefit, index) => { const Icon = benefit.icon; return <div key={benefit.title} className="group relative"><div className="mb-6 flex items-center justify-between"><span className="text-sm font-semibold text-brand-text">0{index + 1}</span><Icon size={30} weight="duotone" className="text-brand-deep transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" aria-hidden="true" /></div><h3 className="text-2xl font-bold tracking-tight">{benefit.title}</h3><p className="mt-3 max-w-[28ch] text-[16px] leading-relaxed text-ink-soft">{benefit.text}</p></div>; })}</div></div></section>

      <section className="overflow-hidden bg-ink text-white"><div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20"><div className="order-2 md:order-1 md:col-span-6"><div className="mb-6 flex items-center gap-2 text-brand"><Headphones size={22} weight="fill" aria-hidden="true" /><span className="text-sm font-semibold uppercase tracking-[.14em]">The mechanism</span></div><h2 className="max-w-[12ch] text-4xl font-extrabold leading-[.95] tracking-[-.05em] md:text-6xl">The app makes your language useful.</h2><p className="mt-6 max-w-[38ch] text-[17px] leading-relaxed text-night-soft">Choose a prompt, record naturally, and send it in. Your contribution becomes part of a larger voice library while you build your reward balance.</p><ul className="mt-8 space-y-3 text-[15px] text-white/85"><li className="flex items-center gap-3"><Check size={18} weight="bold" className="text-brand" aria-hidden="true" /> Short prompts made for everyday speech</li><li className="flex items-center gap-3"><Check size={18} weight="bold" className="text-brand" aria-hidden="true" /> Works with the voice you already have</li><li className="flex items-center gap-3"><Check size={18} weight="bold" className="text-brand" aria-hidden="true" /> Clear points for every accepted contribution</li></ul></div><div className="order-1 md:order-2 md:col-span-6"><div className="relative mx-auto max-w-[470px] overflow-hidden rounded-[24px] bg-tint p-3 text-ink shadow-[0_22px_70px_rgba(0,0,0,.25)]"><Image src={recordImg} alt="A young man wearing headphones and holding his phone" sizes="(min-width: 768px) 470px, 90vw" className="aspect-[1.2] rounded-[17px] object-cover" /><div className="relative -mt-7 mx-4 rounded-2xl bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><div><p className="text-[12px] font-semibold uppercase tracking-[.14em] text-brand-text">Today&apos;s prompt</p><p className="mt-1 text-lg font-bold">Tell us about home.</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand"><Microphone size={20} weight="fill" aria-hidden="true" /></span></div><div className="group mt-3 flex items-center gap-3 rounded-xl bg-tint px-3 py-2"><Waveform /><span className="text-xs font-semibold text-ink-soft">Tap to record</span></div></div></div></div></div></section>

      <section className="relative overflow-hidden border-b border-line bg-tint"><div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24"><div className="md:col-span-5"><div className="mb-5 flex items-center gap-2 text-brand-text"><Sparkle size={19} weight="fill" aria-hidden="true" /><span className="text-sm font-semibold uppercase tracking-[.14em]">A wider conversation</span></div><h2 className="max-w-[12ch] text-4xl font-extrabold leading-[.95] tracking-[-.05em] md:text-6xl">Many voices. One living network.</h2><p className="mt-6 max-w-[36ch] text-[17px] leading-relaxed text-ink-soft">LinguaLink is for speakers, listeners, and everyone who wants the languages around them to stay visible.</p></div><div className="min-h-[300px] md:col-span-7"><ConnectionIllustration /></div></div></section>

      <section id="get" className="bg-brand"><div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-20"><div><h2 className="max-w-[13ch] text-4xl font-extrabold leading-[.95] tracking-[-.05em] text-ink md:text-6xl">Put your language on the record.</h2><p className="mt-5 max-w-[34ch] text-[17px] leading-relaxed text-ink/75">Create your account and make your first contribution today.</p></div><div className="flex flex-wrap items-center gap-4"><a href={authLinks.signUp} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[16px] font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[.98]">Create your account <ArrowUpRight size={19} weight="bold" aria-hidden="true" /></a><a href={authLinks.signIn} className="font-semibold text-ink underline underline-offset-4">Log in</a></div></div></section>
    </>
  );
}
