import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { adminPortalUrl } from "@/lib/site-urls";
import { Logo } from "./Logo";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#F5F1E8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-600">
            Helping every voice stay visible in the digital world.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-gray-600">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#FF8201]">
              {link.label}
            </Link>
          ))}
          <a
            href={adminPortalUrl}
            className="transition hover:text-[#FF8201]"
          >
            Admin login
          </a>
        </nav>

        <a
          href="mailto:hello@lingualink.app"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#B0470A] transition hover:text-[#FF8201]"
        >
          hello@lingualink.app
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </a>
      </div>
      <div className="border-t border-gray-200 px-6 py-4 text-center text-xs text-gray-500">
        © 2025 LinguaLinkAI
      </div>
    </footer>
  );
}
