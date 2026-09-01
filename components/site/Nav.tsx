"use client";

import { useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import { appUrl } from "@/lib/site-urls";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/#features", label: "Features" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-[#F5F1E8]/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="relative px-4 py-2 text-[15px] font-medium text-gray-700 transition hover:text-gray-900">
              {link.label}
              <span aria-hidden="true" className="absolute bottom-0 left-4 h-0.5 w-0 bg-gradient-to-r from-[#FF8201] to-[#FF6B00] transition-[width]" />
            </a>
          ))}
          <a href={appUrl + "/sign-up"} className="ml-3 rounded-full bg-gradient-to-r from-[#FF8201] to-[#FF6B00] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-px hover:shadow-xl">
            Get Started
          </a>
        </nav>
        <button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-800 hover:bg-orange-100 md:hidden" aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-gray-200 bg-white px-5 pb-6 pt-3 shadow-xl md:hidden">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block border-b border-gray-100 py-4 text-[17px] font-semibold text-gray-800">
              {link.label}
            </a>
          ))}
          <a href={appUrl + "/sign-up"} onClick={() => setOpen(false)} className="mt-5 block rounded-full bg-gradient-to-r from-[#FF8201] to-[#FF6B00] py-3.5 text-center text-[16px] font-semibold text-white">
            Get Started
          </a>
        </nav>
      )}
    </header>
  );
}
