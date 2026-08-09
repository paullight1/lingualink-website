import Link from "next/link";
import { Logo } from "./Logo";
import { adminPortalUrl, appUrl } from "@/lib/site-urls";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/faq", label: "FAQ" },
      { href: `${appUrl}/sign-in`, label: "Log in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-tint">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
              Record the language you know. Add value to the voice data future.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-ink">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-ink-soft transition-colors hover:text-brand-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LinguaLink. Made with love for African languages.</p>
          <p>
            <a
              href={adminPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="mr-5 font-semibold text-brand-text underline underline-offset-2 hover:text-brand-deep"
            >
              Admin login
            </a>
            Photos by generous photographers on{" "}
            <a
              href="https://unsplash.com"
              className="underline underline-offset-2 hover:text-brand-text"
            >
              Unsplash
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
