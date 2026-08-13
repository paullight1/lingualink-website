import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { DarkCta } from "@/components/site/DarkCta";
import { posts, getPost, formatDate } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.cover] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <article>
        <header className="border-b border-line bg-tint">
          <div className="mx-auto max-w-3xl px-5 pb-12 pt-14 md:px-8 md:pb-16 md:pt-20">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand-text hover:underline"
            >
              <ArrowLeft size={16} aria-hidden="true" /> All posts
            </Link>
            <h1 className="mt-6 text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-[14px] text-ink-soft">
              {post.category} · {formatDate(post.date)} · {post.readMinutes} min
              read
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            width={1600}
            height={1000}
            priority
            sizes="(min-width: 896px) 832px, 100vw"
            className="mt-10 aspect-[16/9] rounded-card object-cover"
          />
        </div>

        <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
          <div className="space-y-6">
            {post.body.map((block, i) => {
              switch (block.type) {
                case "h2":
                  return (
                    <h2
                      key={i}
                      className="pt-4 text-2xl font-extrabold tracking-tight"
                    >
                      {block.text}
                    </h2>
                  );
                case "quote":
                  return (
                    <blockquote
                      key={i}
                      className="rounded-card bg-tint p-7 text-xl font-bold leading-snug tracking-tight text-ink"
                    >
                      {block.text}
                    </blockquote>
                  );
                case "ul":
                  return (
                    <ul key={i} className="space-y-3">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex gap-3 text-[17px] leading-relaxed text-ink-soft">
                          <span
                            aria-hidden="true"
                            className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-deep"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                default:
                  return (
                    <p key={i} className="max-w-[68ch] text-[17px] leading-relaxed text-ink-soft">
                      {block.text}
                    </p>
                  );
              }
            })}
          </div>
        </div>
      </article>

      {/* Keep reading */}
      <section className="border-t border-line bg-tint">
        <div className="mx-auto max-w-4xl px-5 py-14 md:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Keep reading
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/blog/${other.slug}`}
                className="group block"
              >
                <div className="overflow-hidden rounded-card">
                  <Image
                    src={other.cover}
                    alt={other.coverAlt}
                    width={900}
                    height={600}
                    sizes="(min-width: 640px) 45vw, 100vw"
                    className="aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight group-hover:text-brand-text">
                  {other.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DarkCta />
    </>
  );
}
