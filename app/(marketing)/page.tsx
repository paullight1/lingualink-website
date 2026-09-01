import {
  ArrowRight,
  Broadcast,
  Buildings,
  ChatCircleDots,
  CheckCircle,
  GlobeHemisphereWest,
  Megaphone,
  Microphone,
  Sparkle,
  Trophy,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { appUrl } from "@/lib/site-urls";

const featureCards = [
  { icon: Microphone, title: "Voice Data Collection", description: "Record phrases, songs, slang, and proverbs in your own voice.", tone: "from-orange-100 to-amber-50 text-orange-600" },
  { icon: ChatCircleDots, title: "Duet & Remix Engine", description: "Compare dialects and create language pairs with your community.", tone: "from-purple-100 to-fuchsia-50 text-purple-600" },
  { icon: CheckCircle, title: "Validation Network", description: "Review clips together so the final dataset stays trustworthy.", tone: "from-emerald-100 to-green-50 text-emerald-600" },
  { icon: Sparkle, title: "Create Story Mode", description: "Turn a voice prompt into a story rooted in local culture.", tone: "from-blue-100 to-cyan-50 text-blue-600" },
  { icon: Buildings, title: "API / Dataset Licensing", description: "Give teams access to clean, community-validated language data.", tone: "from-rose-100 to-orange-50 text-rose-600" },
  { icon: Trophy, title: "Rewards System", description: "Earn points for contributing, validating, and helping others.", tone: "from-yellow-100 to-amber-50 text-amber-600" },
];

const useCases = [
  { number: "01", icon: Sparkle, title: "AI Companies", description: "Train translation, speech recognition, and assistants in underserved languages." },
  { number: "02", icon: Megaphone, title: "Brands & Advertisers", description: "Reach communities with campaigns that sound like home." },
  { number: "03", icon: Broadcast, title: "Media & Broadcasters", description: "Make shows and programs accessible in more local languages." },
  { number: "04", icon: Buildings, title: "Governments & NGOs", description: "Document endangered dialects and protect cultural memory." },
];

const impact = [
  { icon: GlobeHemisphereWest, title: "Inclusion", value: "7,000+", detail: "Languages", copy: "More voices in the systems people use every day." },
  { icon: UsersThree, title: "Empowerment", value: "150K+", detail: "Contributors", copy: "Communities share in the value of their data." },
  { icon: Microphone, title: "Preservation", value: "2.5M+", detail: "Voice Clips", copy: "Stories, proverbs, and songs kept alive." },
  { icon: Sparkle, title: "AI Impact", value: "1B+", detail: "People Reached", copy: "Technology that understands more people." },
];

const testimonials = [
  { mark: "AO", quote: "My grandmother's dialect will live forever.", name: "Amara Okafor", role: "Community Contributor", location: "Lagos, Nigeria", tone: "bg-orange-50" },
  { mark: "SC", quote: "These datasets are a goldmine for AI researchers.", name: "Dr. Sarah Chen", role: "AI Research Partner", location: "Stanford, USA", tone: "bg-purple-50" },
  { mark: "DM", quote: "We reached new customers in seven dialects.", name: "David Mensah", role: "Brand Marketing Director", location: "Accra, Ghana", tone: "bg-blue-50" },
];

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#FF8201]">{children}</p>;
}

/* The homepage hero is intentionally text-first; the former artwork is retained below only as a design reference.
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[440px]">
      <div className="absolute inset-3 rounded-[3rem] bg-gradient-to-br from-orange-200 via-amber-100 to-purple-200 opacity-70 blur-2xl" />
      <div className="absolute left-0 top-20 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-4xl shadow-xl">🌍</div>
      <div className="absolute right-0 top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl shadow-lg">💬</div>
      <div className="absolute bottom-20 right-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-3xl shadow-lg">✨</div>
      <div className="absolute inset-x-8 bottom-4 top-4 rounded-[2.75rem] border-[12px] border-gray-900 bg-gray-900 p-3 shadow-2xl">
        <div className="flex h-full flex-col rounded-[2rem] bg-gradient-to-b from-[#FFF8F0] to-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-gray-900">LinguaLinkAI</span>
            <span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_0_5px_rgba(34,197,94,.12)]" />
          </div>
          <div className="mt-12 flex flex-1 flex-col items-center justify-center">
            <div className="flex h-28 items-center gap-2 rounded-full bg-orange-50 px-8">
              {[32, 56, 84, 48, 72, 38, 64].map((height, index) => <span key={index} className="w-2 rounded-full bg-gradient-to-b from-[#FF8201] to-[#FFB15C]" style={{ height }} />)}
            </div>
            <p className="mt-8 text-center text-2xl font-black leading-tight text-gray-900">Your voice<br /><span className="text-orange-600">has a place.</span></p>
            <p className="mt-3 text-center text-sm text-gray-500">Record a phrase in your language.</p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-gray-900 p-3 text-white">
            <span className="text-xs font-semibold text-white/70">Ready to record</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF8201]"><Microphone size={20} weight="fill" /></span>
          </div>
        </div>
      </div>
    </div>
  );
*/

function MissionIllustration() {
  return (
    <div className="relative mx-auto aspect-square max-w-[480px]">
      <div className="absolute inset-8 rounded-full border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-purple-50 shadow-inner" />
      <div className="absolute inset-20 flex items-center justify-center rounded-full bg-white shadow-xl"><GlobeHemisphereWest size={150} weight="duotone" className="text-[#FF8201]" /></div>
      <div className="absolute left-2 top-16 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-xl"><Microphone size={22} className="text-orange-600" /> Voice</div>
      <div className="absolute bottom-20 right-0 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-xl"><ChatCircleDots size={22} className="text-purple-600" /> Story</div>
      <div className="absolute bottom-2 left-16 flex items-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-xl"><UsersThree size={22} className="text-orange-300" /> Community</div>
      <div className="absolute right-10 top-5 h-12 w-12 rounded-full bg-purple-200" />
      <div className="absolute bottom-16 left-0 h-8 w-8 rounded-full bg-orange-300" />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F5F1E8] text-gray-800">
      <section id="home" className="relative bg-gradient-to-br from-[#F5F1E8] via-[#FFF8F0] to-[#F5F1E8] pt-28">
        <div className="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-[#FF8201]/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 pb-20 text-center lg:px-8 lg:pb-28">
          <div className="mx-auto w-[calc(100vw-3rem)] min-w-0 max-w-3xl sm:w-auto">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm"><span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />Bridging Cultures, Powering AI</div>
            <h1 className="w-full max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-gray-900 sm:text-6xl lg:text-7xl">Giving Every Voice a <span className="bg-gradient-to-r from-[#FF8201] to-[#FF6B00] bg-clip-text text-transparent">Digital Future</span></h1>
            <p className="mx-auto mt-7 w-full max-w-[320px] break-words text-base leading-relaxed text-gray-600 sm:max-w-xl sm:text-xl">Record a phrase. Keep your language visible. Help AI understand more people.</p>
            <div className="mt-9 flex justify-center"><a href={appUrl + "/sign-up"} className="inline-flex w-full max-w-[320px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF8201] to-[#FF6B00] px-7 py-4 font-bold text-white shadow-xl shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-2xl sm:w-auto">Get Started <ArrowRight size={19} weight="bold" /></a></div>
            <div className="mx-auto mt-10 flex w-full max-w-full flex-wrap justify-center gap-5 text-sm text-gray-500"><span className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full bg-green-500" /> Record</span><span className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full bg-purple-500" /> Duet &amp; Remix</span><span className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full bg-blue-500" /> Validate</span><span className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Earn</span></div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white px-6 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mx-auto max-w-3xl text-center"><SectionEyebrow>Feature Showcase</SectionEyebrow><h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">Voice data from the languages AI still misses.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">Simple tools for recording, checking, sharing, and preserving language.</p></div><div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featureCards.map((feature) => { const Icon = feature.icon; return <article key={feature.title} className="group rounded-3xl border border-gray-100 bg-[#FFFCF8] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100/60"><div className={"flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm " + feature.tone}><Icon aria-hidden="true" size={28} weight="duotone" /></div><h3 className="mt-7 text-xl font-black text-gray-900">{feature.title}</h3><p className="mt-3 text-[15px] leading-relaxed text-gray-600">{feature.description}</p></article>; })}</div></div></section>

      <section id="aboutus" className="bg-[#F5F1E8] px-6 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><div className="text-center"><SectionEyebrow>Where It Helps</SectionEyebrow><h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">Your Language Is At The Center Of Our Process</h2><p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">One source of language data. Four ways to put it to work.</p></div><div className="mt-16 grid gap-5 md:grid-cols-2">{useCases.map((item) => { const Icon = item.icon; return <article key={item.number} className="group rounded-3xl border border-orange-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100/50"><div className="flex items-start justify-between"><span className="text-5xl font-black tracking-tight text-orange-100 transition group-hover:text-orange-200">{item.number}</span><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Icon size={28} weight="duotone" /></div></div><h3 className="mt-7 text-2xl font-black text-gray-900">{item.title}</h3><p className="mt-3 max-w-xl leading-relaxed text-gray-600">{item.description}</p></article>; })}</div></div></section>

      <section className="bg-white px-6 py-24 lg:px-8"><div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2"><div><SectionEyebrow>Our Mission</SectionEyebrow><h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">Make every language count.</h2><p className="mt-6 text-lg leading-relaxed text-gray-600">LinguaLink gives communities a place to record, share, and protect the languages they live in.</p><p className="mt-5 leading-relaxed text-gray-600">The result is useful voice data for better products—and a living archive for the people who created it.</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{["Voice recording & storytelling", "Community validation", "Real-time communication", "Rewards for contributors"].map((item) => <div key={item} className="flex items-start gap-3 text-sm font-semibold text-gray-700"><CheckCircle className="mt-0.5 shrink-0 text-orange-500" size={20} weight="fill" />{item}</div>)}</div><a href={appUrl + "/sign-up"} className="mt-9 inline-flex items-center gap-2 font-bold text-orange-600 hover:text-orange-700">Get Started <ArrowRight size={18} weight="bold" /></a></div><MissionIllustration /></div></section>

      <section className="bg-gradient-to-br from-[#FFF8F0] to-white px-6 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><div className="text-center"><SectionEyebrow>Why It Matters</SectionEyebrow><h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">More voices. Better technology.</h2><p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">Every contribution helps keep a language visible and useful.</p></div><div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{impact.map((item) => { const Icon = item.icon; return <article key={item.title} className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><Icon size={32} weight="duotone" /></div><p className="mt-5 text-sm font-bold uppercase tracking-wider text-gray-500">{item.title}</p><p className="mt-4 text-4xl font-black text-gray-900">{item.value}</p><p className="text-sm font-bold text-orange-600">{item.detail}</p><p className="mt-4 text-sm leading-relaxed text-gray-600">{item.copy}</p></article>; })}</div></div></section>

      <section className="bg-white px-6 py-24 lg:px-8"><div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2"><div><SectionEyebrow>For Partners &amp; Investors</SectionEyebrow><h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">Build with language data people trust.</h2><p className="mt-6 text-lg leading-relaxed text-gray-600">Use community-validated voices to build products that work across more markets.</p><div className="mt-8 space-y-4">{[["🤖", "Train inclusive AI products"], ["📢", "Reach audiences in their own voices"], ["🏛️", "Protect cultural heritage"]].map(([icon, text]) => <div key={text} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#FFFCF8] p-4 font-semibold text-gray-700"><span className="text-2xl">{icon}</span>{text}</div>)}</div><a href="#contact" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF8201] to-[#FF6B00] px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-200">Talk to Our Team <ArrowRight size={18} weight="bold" /></a></div><div className="relative rounded-[2rem] bg-gradient-to-br from-orange-100 via-amber-50 to-purple-100 p-8 shadow-xl"><div className="rounded-3xl bg-white/80 p-8 backdrop-blur"><div className="flex items-center justify-between"><p className="text-sm font-bold uppercase tracking-wider text-gray-500">The opportunity</p><Sparkle size={24} className="text-orange-500" /></div><div className="mt-8 grid grid-cols-2 gap-8"><div><p className="text-4xl font-black text-gray-900">7,000+</p><p className="mt-1 text-sm text-gray-600">Languages worldwide</p></div><div><p className="text-4xl font-black text-orange-600">200</p><p className="mt-1 text-sm text-gray-600">In AI systems</p></div><div><p className="text-4xl font-black text-gray-900">97%</p><p className="mt-1 text-sm text-gray-600">Languages missing</p></div><div><p className="text-4xl font-black text-purple-600">1B+</p><p className="mt-1 text-sm text-gray-600">People underserved</p></div></div><div className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-gray-900 p-5 text-white"><UsersThree size={26} className="text-orange-300" /><span className="font-bold">Built with communities.</span></div></div></div></div></section>

      <section className="bg-[#F5F1E8] px-6 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><div className="text-center"><SectionEyebrow>Real Stories, Real Impact</SectionEyebrow><h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">Trusted by Communities &amp; Enterprises</h2></div><div className="mt-14 grid gap-5 lg:grid-cols-3">{testimonials.map((item) => <article key={item.name} className={"rounded-3xl p-7 shadow-sm " + item.tone}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-orange-600 shadow-sm">{item.mark}</div><p className="mt-7 text-xl font-bold leading-relaxed text-gray-800">“{item.quote}”</p><div className="mt-8 border-t border-gray-900/10 pt-5"><p className="font-black text-gray-900">{item.name}</p><p className="mt-1 text-sm text-gray-600">{item.role}</p><p className="mt-2 text-xs font-semibold text-orange-700">📍 {item.location}</p></div></article>)}</div></div></section>

      <section id="get-started" className="relative overflow-hidden bg-gradient-to-br from-[#FF8201] to-[#FF6B00] px-6 py-24 text-white lg:px-8"><div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" /><div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" /><div className="relative mx-auto max-w-4xl text-center"><div className="text-4xl">🌍 💬 ✨</div><p className="mt-7 text-sm font-bold uppercase tracking-[0.24em] text-white/75">Join the Revolution</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Your Voice. Your Culture. Your Future.</h2><p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85">Start with one phrase. Keep your language in the conversation.</p><a href={appUrl + "/sign-up"} className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-orange-600 shadow-xl transition hover:-translate-y-0.5">Get Started <ArrowRight size={18} weight="bold" /></a><div className="mt-12 flex flex-wrap justify-center gap-8 text-sm font-semibold text-white/85"><span>5,000+ Contributors</span><span>50+ Languages</span><span>20+ Countries</span></div></div></section>

      <section id="contact" className="bg-white px-6 py-20 text-center lg:px-8"><div className="mx-auto max-w-3xl"><SectionEyebrow>Get In Touch</SectionEyebrow><h2 className="mt-4 text-4xl font-black tracking-tight text-gray-900">Let&apos;s preserve every voice together.</h2><p className="mx-auto mt-5 max-w-xl text-lg text-gray-600">Have a partnership idea or want to contribute? Tell us about it.</p><a href="mailto:hello@LinguaLinkAI.ai" className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-50 px-7 py-4 font-bold text-orange-700 transition hover:bg-orange-100">hello@LinguaLinkAI.ai <ArrowRight size={18} weight="bold" /></a></div></section>
    </div>
  );
}
