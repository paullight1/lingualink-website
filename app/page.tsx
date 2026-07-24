import Image from "next/image";
import Link from "next/link";
import {
  ChatCircleDots,
  CheckCircle,
  Fire,
  Microphone,
  UsersThree,
  VideoCamera,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/site/Reveal";
import { DarkCta } from "@/components/site/DarkCta";
import { posts, formatDate } from "@/lib/posts";
import heroImg from "@/public/images/hero.jpg";
import recordImg from "@/public/images/record.jpg";
import communityImg from "@/public/images/community.jpg";
import earnImg from "@/public/images/earn.jpg";

/* Greetings from Nigerian languages, shown in the moving strip under the hero. */
const greetings = [
  { word: "Ẹ n lẹ́", lang: "Yorùbá" },
  { word: "Kedu", lang: "Igbo" },
  { word: "Sannu", lang: "Hausa" },
  { word: "How far", lang: "Naijá" },
  { word: "Kóyo", lang: "Edo" },
  { word: "Emesiere", lang: "Efik" },
  { word: "Jam na?", lang: "Fulfulde" },
  { word: "Mavọ", lang: "Urhobo" },
];

const steps = [
  {
    icon: Microphone,
    title: "Record",
    text: "Pick a phrase and say it in your language. One clip takes about ten seconds.",
  },
  {
    icon: CheckCircle,
    title: "Check",
    text: "Listen to clips from other speakers and confirm they sound right. This earns too.",
  },
  {
    icon: Wallet,
    title: "Get paid",
    text: "Points become cash. Withdraw to your bank account or mobile wallet when you want.",
  },
];

export default function HomePage() {
  const [featured, ...rest] = posts;

  return (
    <>
      {/* Hero: asymmetric split, portrait right */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-tint-deep opacity-60 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 md:grid-cols-12 md:px-8 md:pb-24 md:pt-20">
          <div className="md:col-span-6 lg:col-span-6">
            <div className="rise">
              <h1 className="text-5xl font-extrabold leading-[1.02] tracking-[-0.02em] md:text-6xl">
                Speak your language.
                <br />
                <span className="text-brand-deep">Get paid for it.</span>
              </h1>
            </div>
            <div className="rise" style={{ animationDelay: "0.1s" }}>
              <p className="mt-6 max-w-[36ch] text-lg leading-relaxed text-ink-soft">
                Record short phrases in Yoruba, Igbo, Hausa and more. Every
                clip helps keep your language alive.
              </p>
            </div>
            <div className="rise" style={{ animationDelay: "0.2s" }}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="#get"
                  className="rounded-full bg-gradient-to-br from-brand to-brand-deep px-8 py-4 text-[17px] font-bold text-ink transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Get the app
                </Link>
                <Link
                  href="#how"
                  className="rounded-full border border-line px-8 py-4 text-[17px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand-text"
                >
                  See how it works
                </Link>
              </div>
            </div>
          </div>
          <div
            className="rise md:col-span-6"
            style={{ animationDelay: "0.15s" }}
          >
            <div className="relative mx-auto max-w-[440px]">
              <div
                aria-hidden="true"
                className="absolute -right-4 -top-4 h-28 w-28 rounded-[24px] bg-gradient-to-br from-brand to-brand-deep"
              />
              <Image
                src={heroImg}
                alt="A woman laughing with her city behind her at dusk"
                priority
                sizes="(min-width: 768px) 440px, 90vw"
                className="relative rounded-card object-cover shadow-[0_24px_80px_rgba(255,95,0,0.18)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Greetings strip: one marquee, real language content */}
      <section
        aria-label="Greetings in Nigerian languages"
        className="overflow-hidden border-y border-line bg-tint py-7"
      >
        <div className="marquee-track flex w-max items-baseline gap-16 pr-16">
          {[...greetings, ...greetings].map((g, i) => (
            <span key={i} className="flex items-baseline gap-3 whitespace-nowrap">
              <span className="text-2xl font-bold text-ink md:text-3xl">
                {g.word}
              </span>
              <span className="text-sm font-medium text-brand-text">
                {g.lang}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* How it works: heading column + real 3-step sequence */}
      <section id="how" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-12 md:px-8 md:py-28">
          <div className="md:col-span-5">
            <div className="md:sticky md:top-28">
              <Reveal>
                <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
                  Three steps. Real money.
                </h2>
                <p className="mt-5 max-w-[38ch] text-[17px] leading-relaxed text-ink-soft">
                  No special skills needed. If you can speak your language, you
                  can do this.
                </p>
              </Reveal>
            </div>
          </div>
          <div className="md:col-span-7">
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.08}>
                  <li className="flex gap-6 rounded-card border border-line bg-white p-7 md:p-8">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-tint text-brand-deep">
                      <step.icon size={28} weight="duotone" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        <span className="mr-2 text-brand-text">{i + 1}.</span>
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-[48ch] text-[16px] leading-relaxed text-ink-soft">
                        {step.text}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Feature split: recording */}
      <section className="bg-tint">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
          <Reveal>
            <Image
              src={recordImg}
              alt="A young man wearing headphones, holding his phone"
              sizes="(min-width: 768px) 520px, 90vw"
              className="rounded-card object-cover"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              Ten seconds is enough.
            </h2>
            <p className="mt-5 max-w-[44ch] text-[17px] leading-relaxed text-ink-soft">
              The app gives you short, everyday phrases: greetings, numbers,
              family words, market talk. You read one, tap record, and speak.
              A waveform shows your voice as you go.
            </p>
            <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed text-ink-soft">
              No network? No problem. Record offline and your clips upload
              later, using less than 2MB per session.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Bento: what's inside the app */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <h2 className="max-w-[18ch] text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              More than a recording tool.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-6">
            <Reveal className="md:col-span-4">
              <div className="relative h-full min-h-[300px] overflow-hidden rounded-card">
                <Image
                  src={communityImg}
                  alt="Two friends in bright dresses sitting and talking together"
                  fill
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-7 pt-20">
                  <div className="flex items-center gap-2.5 text-brand">
                    <UsersThree size={22} weight="fill" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-white">Community</h3>
                  </div>
                  <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-white/85">
                    Follow other speakers, like and comment on clips, and join
                    weekly challenges in your language.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-2">
              <div className="flex h-full flex-col justify-between rounded-card bg-gradient-to-br from-brand to-brand-deep p-7">
                <ChatCircleDots size={30} weight="duotone" aria-hidden="true" className="text-ink" />
                <div className="mt-16">
                  <h3 className="text-lg font-bold text-ink">Voice clips</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink/80">
                    Phrases, proverbs and stories, recorded in your own accent
                    and dialect.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal className="md:col-span-2">
              <div className="flex h-full flex-col justify-between rounded-card bg-night p-7">
                <Fire size={30} weight="duotone" aria-hidden="true" className="text-brand" />
                <div className="mt-16">
                  <h3 className="text-lg font-bold text-white">
                    Streaks and badges
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-night-soft">
                    Daily streaks multiply your points. Badges mark your
                    milestones.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="md:col-span-2">
              <div className="flex h-full flex-col justify-between rounded-card border border-line bg-tint p-7">
                <VideoCamera size={30} weight="duotone" aria-hidden="true" className="text-brand-deep" />
                <div className="mt-16">
                  <h3 className="text-lg font-bold">Video and stories</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">
                    Short videos and day-in-the-life stories, all in your
                    language.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.16} className="md:col-span-2">
              <div className="relative h-full min-h-[260px] overflow-hidden rounded-card">
                <Image
                  src={earnImg}
                  alt="A man in sunglasses smiling while talking on his phone at a cafe"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/85 to-transparent p-7 pt-16">
                  <div className="flex items-center gap-2.5 text-brand">
                    <Wallet size={22} weight="fill" aria-hidden="true" />
                    <h3 className="text-lg font-bold text-white">Earnings</h3>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-white/85">
                    Watch your balance grow and withdraw whenever you like.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Voices from the community: two offset quotes */}
      <section className="border-y border-line bg-tint">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-14 md:grid-cols-12">
            <Reveal className="md:col-span-6">
              <figure>
                <blockquote className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                  “My grandmother's proverbs are now part of something big. I
                  recorded forty of them in one weekend.”
                </blockquote>
                <figcaption className="mt-5 text-[15px] text-ink-soft">
                  <span className="font-semibold text-ink">Adaeze Nwosu</span>,
                  recording Igbo in Enugu
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.12} className="md:col-span-5 md:col-start-8 md:mt-24">
              <figure>
                <blockquote className="text-2xl font-bold leading-snug tracking-tight md:text-3xl">
                  “I check clips on the bus to work. It pays my data bill every
                  month.”
                </blockquote>
                <figcaption className="mt-5 text-[15px] text-ink-soft">
                  <span className="font-semibold text-ink">Musa Abdullahi</span>,
                  validating Hausa in Kano
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Latest from the blog: featured + two compact rows */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
                From the blog
              </h2>
              <Link
                href="/blog"
                className="text-[16px] font-semibold text-brand-text underline-offset-4 hover:underline"
              >
                Read all posts
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-7">
              <Link href={`/blog/${featured.slug}`} className="group block">
                <div className="overflow-hidden rounded-card">
                  <Image
                    src={featured.cover}
                    alt={featured.coverAlt}
                    width={1600}
                    height={1000}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-5 text-[13px] font-semibold text-brand-text">
                  {featured.category}
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight group-hover:text-brand-text md:text-3xl">
                  {featured.title}
                </h3>
                <p className="mt-3 max-w-[54ch] text-[16px] leading-relaxed text-ink-soft">
                  {featured.excerpt}
                </p>
              </Link>
            </Reveal>
            <div className="space-y-8 md:col-span-5">
              {rest.slice(0, 2).map((post, i) => (
                <Reveal key={post.slug} delay={0.08 * (i + 1)}>
                  <Link href={`/blog/${post.slug}`} className="group flex gap-5">
                    <div className="w-32 shrink-0 overflow-hidden rounded-card sm:w-40">
                      <Image
                        src={post.cover}
                        alt={post.coverAlt}
                        width={480}
                        height={480}
                        sizes="160px"
                        className="aspect-square object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-brand-text">
                        {post.category}
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold leading-snug tracking-tight group-hover:text-brand-text">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-[14px] text-ink-soft">
                        {formatDate(post.date)}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <DarkCta />
    </>
  );
}
