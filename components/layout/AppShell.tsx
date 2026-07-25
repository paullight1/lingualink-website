"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Library,
  Bell,
  Menu as MenuIcon,
  MessageSquare,
  Gamepad2,
  Plus,
  Trophy,
  Users,
  Wallet,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateSheet } from "./CreateSheet";

/**
 * Authenticated app shell: left sidebar on desktop, bottom tab bar on mobile,
 * with a raised center "Create" FAB that opens the CreateSheet. Wrap every
 * authenticated page's content in <AppShell>.
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Bottom tab bar mirrors mobile: Home · Library · [Create] · Chat · Menu.
const PRIMARY: NavItem[] = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: Library },
  { href: "/chat", label: "Chats", icon: MessageSquare },
  { href: "/menu", label: "Menu", icon: MenuIcon },
];

const SECONDARY: NavItem[] = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/validate", label: "Validate", icon: CheckCircle2 },
  { href: "/rewards", label: "Wallet", icon: Wallet },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-1 border-r border-[var(--border-light)] p-4 md:flex">
        <Link href="/feed" className="mb-6 flex items-center gap-2 px-2">
          <span className="text-xl font-extrabold tracking-tight text-brand-gradient">
            LinguaLink
          </span>
        </Link>

        {PRIMARY.map((item) => (
          <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}

        <button
          onClick={() => setCreateOpen(true)}
          className="mt-2 flex items-center gap-3 rounded-full bg-brand-gradient px-4 py-3 font-semibold text-white shadow-glow transition hover:brightness-105"
        >
          <Plus className="h-5 w-5" />
          Create
        </button>

        <div className="my-4 h-px bg-[var(--border-light)]" />

        {SECONDARY.map((item) => (
          <SidebarLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </aside>

      {/* Main column */}
      <main className="min-w-0 flex-1 pb-24 md:pb-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--border-light)] bg-[var(--surface)]/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <MobileTab item={PRIMARY[0]} active={isActive(pathname, PRIMARY[0].href)} />
        <MobileTab item={PRIMARY[1]} active={isActive(pathname, PRIMARY[1].href)} />
        <button
          onClick={() => setCreateOpen(true)}
          aria-label="Create"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow"
        >
          <Plus className="h-7 w-7" />
        </button>
        <MobileTab item={PRIMARY[2]} active={isActive(pathname, PRIMARY[2].href)} />
        <MobileTab item={PRIMARY[3]} active={isActive(pathname, PRIMARY[3].href)} />
      </nav>

      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--input)] text-[var(--color-primary)]"
          : "text-[var(--muted)] hover:bg-[var(--input)] hover:text-[var(--foreground)]"
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

function MobileTab({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      className={cn(
        "flex h-14 w-14 items-center justify-center",
        active ? "text-[var(--color-primary)]" : "text-[var(--muted)]"
      )}
    >
      <Icon className="h-6 w-6" />
    </Link>
  );
}
