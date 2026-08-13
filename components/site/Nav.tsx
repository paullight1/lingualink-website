"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "./Logo";
import { appUrl } from "@/lib/site-urls";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];


export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md ${
        isHome
          ? "border-white/15 bg-[#f97316]/75 text-white"
          : "border-line bg-white/85"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-5 md:px-8">
        <Logo inverted={isHome} />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[15px] font-medium transition-colors ${
                isHome
                  ? "text-white/75 hover:text-white"
                  : "hover:text-brand-deep"
              } ${
                pathname === link.href
                  ? isHome
                    ? "text-white"
                    : "text-brand-text"
                  : isHome
                    ? "text-white/75"
                    : "text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`${appUrl}/sign-in`}
            className={`text-[15px] font-semibold transition-colors ${
              isHome ? "text-white/80 hover:text-white" : "text-ink-soft hover:text-brand-deep"
            }`}
          >
            Sign In
          </a>
          <a
            href={`${appUrl}/sign-up`}
            className={`rounded-full px-5 py-2.5 text-[15px] font-semibold transition-transform hover:-translate-y-px active:scale-[0.98] ${
              isHome ? "bg-white text-orange-600" : "bg-brand text-ink"
            }`}
          >
            Get Started
          </a>
        </nav>

        <button
          type="button"
          className={`flex h-10 w-10 items-center justify-center rounded-full md:hidden ${
            isHome ? "text-white" : "text-ink"
          }`}
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
          className={`border-t px-5 pb-6 pt-2 md:hidden ${
            isHome ? "border-white/15 bg-orange-600" : "border-line bg-white"
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block border-b py-4 text-[17px] font-medium ${
                isHome
                  ? "border-white/15 text-white"
                  : "border-line text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`${appUrl}/sign-in`}
            onClick={() => setOpen(false)}
            className={`block border-b py-4 text-[17px] font-semibold ${
              isHome ? "border-white/15 text-white" : "border-line text-ink"
            }`}
          >
            Sign In
          </a>
          <a
            href={`${appUrl}/sign-up`}
            onClick={() => setOpen(false)}
            className={`mt-5 block rounded-full px-5 py-3.5 text-center text-[16px] font-semibold ${
              isHome
                ? "bg-white text-orange-600"
                : "bg-gradient-to-br from-brand to-brand-deep text-ink"
            }`}
          >
            Get Started
          </a>
        </nav>
      )}
    </header>
  );
}
