"use client";

/** Games hub — pick TurnVerse or Word Chain. */

import Link from "next/link";
import { Gamepad2, Link2, Mic } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui";

const GAMES = [
  {
    href: "/games/turnverse",
    title: "TurnVerse",
    description:
      "Take turns saying the word in your language before the timer runs out.",
    icon: Mic,
    color: "#FF8A00",
  },
  {
    href: "/games/wordchain",
    title: "Word Chain",
    description:
      "Each word must start with the last letter of the one before it.",
    icon: Link2,
    color: "#8B5CF6",
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-10 border-b border-[var(--border-light)] bg-[var(--background)]/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <Gamepad2 className="h-6 w-6 text-[var(--color-primary)]" />
          Games
        </h1>
      </div>

      <PageContainer size="sm">
        <div className="flex flex-col gap-3">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <Link key={game.href} href={game.href}>
                <GlassCard className="flex items-center gap-4 p-5 transition hover:brightness-110">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${game.color}1A`, color: game.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-lg font-bold text-[var(--foreground)]">
                      {game.title}
                    </span>
                    <span className="block text-sm text-[var(--muted)]">
                      {game.description}
                    </span>
                  </span>
                </GlassCard>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </div>
  );
}
