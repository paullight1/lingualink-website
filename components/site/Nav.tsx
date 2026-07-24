"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 md:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[15px] font-medium transition-colors hover:text-brand-deep ${
                pathname === link.href ? "text-brand-text" : "text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#get"
            className="rounded-full bg-gradient-to-br from-brand to-brand-deep px-5 py-2.5 text-[15px] font-semibold text-ink transition-transform hover:-translate-y-px active:scale-[0.98]"
          >
            Get the app
          </Link>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-line bg-white px-5 pb-6 pt-2 md:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-4 text-[17px] font-medium text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#get"
            onClick={() => setOpen(false)}
            className="mt-5 block rounded-full bg-gradient-to-br from-brand to-brand-deep px-5 py-3.5 text-center text-[16px] font-semibold text-ink"
          >
            Get the app
          </Link>
        </nav>
      )}
    </header>
  );
}
