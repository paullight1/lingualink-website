import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";
import { posts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stories, guides and updates from the LinguaLink community: languages, culture, earnings and transparency.",
};

export default function BlogIndexPage() {
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="border-b border-line bg-tint">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
          <Reveal>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              The LinguaLink blog
            </h1>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
              Stories from our community, guides to earning, and honest notes
              on how we handle your voice.
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          {/* Featured post: full-width split */}
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid items-center gap-8 md:grid-cols-2"
            >
              <div className="overflow-hidden rounded-card">
                <Image
                  src={featured.cover}
                  alt={featured.coverAlt}
                  width={1600}
                  height={1000}
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-brand-text">
                  {featured.category}
                </p>
                <h2 className="mt-3 text-3xl font-extrabold leading-[1.1] tracking-tight group-hover:text-brand-text md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-[50ch] text-[17px] leading-relaxed text-ink-soft">
                  {featured.excerpt}
                </p>
                <p className="mt-5 text-[14px] text-ink-soft">
                  {formatDate(featured.date)} · {featured.readMinutes} min read
                </p>
              </div>
            </Link>
          </Reveal>

          {/* Remaining posts */}
          <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.07}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="overflow-hidden rounded-card">
                    <Image
                      src={post.cover}
                      alt={post.coverAlt}
                      width={900}
                      height={600}
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="aspect-[3/2] object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-4 text-[13px] font-semibold text-brand-text">
                    {post.category}
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold leading-snug tracking-tight group-hover:text-brand-text">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
                    {post.excerpt}
                  </p>
                  <p className="mt-3 text-[13px] text-ink-soft">
                    {formatDate(post.date)} · {post.readMinutes} min read
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
