"use client";

/** Owner: Agent 22 — menu hub (profile card + grouped links). */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  ChevronRight,
  Wallet,
  Trophy,
  ShoppingCart,
  Settings as SettingsIcon,
  Bell,
  Bookmark,
  HelpCircle,
  Mail,
  Info,
  LogOut,
} from "lucide-react";
import { useMyProfile } from "@/lib/query/hooks";
import { GlassCard, UserAvatar, SettingsSection, SettingsItem } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { normalizeUsername } from "@/lib/utils";

/** XP thresholds → level name, mirrors mobile `LEVELS`. */
const LEVELS = [
  { name: "Newbie", minXp: 0 },
  { name: "Explorer", minXp: 1000 },
  { name: "Conversationalist", minXp: 5000 },
  { name: "Fluency Seeker", minXp: 10000 },
  { name: "Language Master", minXp: 25000 },
];

function levelForXp(xp: number) {
  return (
    [...LEVELS].reverse().find((l) => xp >= l.minXp) ?? LEVELS[0]
  );
}

export default function MenuPage() {
  const { data: profile, isLoading } = useMyProfile();
  const { signOut } = useClerk();
  const router = useRouter();

  const displayName = profile?.full_name || "LinguaLink User";
  const handle = normalizeUsername(profile?.username || "") || "user";
  const level = levelForXp(profile?.xp ?? 0);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-[var(--border-light)] bg-[var(--background)]/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Menu</h1>
      </div>

      <PageContainer size="sm">
        {/* Profile card */}
        {isLoading ? (
          <div className="mb-6 rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </div>
        ) : (
          <Link href="/profile" className="mb-6 block">
            <GlassCard className="cursor-pointer p-5 transition hover:brightness-110">
              <div className="flex items-center gap-4">
                <UserAvatar
                  uri={profile?.avatar_url}
                  name={displayName}
                  size={72}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-[var(--foreground)]">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-[var(--muted)]">
                    @{handle}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-brand-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    {level.name}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--muted)]" />
              </div>
            </GlassCard>
          </Link>
        )}

        {/* Payments & Earnings */}
        <SettingsSection title="Payments & Earnings">
          <SettingsItem
            icon={<Wallet className="h-4 w-4" />}
            label="Wallet"
            onClick={() => router.push("/rewards")}
          />
          <SettingsItem
            icon={<Trophy className="h-4 w-4" />}
            label="Leaderboard"
            onClick={() => router.push("/leaderboard")}
          />
          <SettingsItem
            icon={<ShoppingCart className="h-4 w-4" />}
            label="Store"
            onClick={() => router.push("/store")}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={<SettingsIcon className="h-4 w-4" />}
            label="Settings"
            onClick={() => router.push("/settings")}
          />
          <SettingsItem
            icon={<Bell className="h-4 w-4" />}
            label="Notifications"
            onClick={() => router.push("/notifications")}
          />
        </SettingsSection>

        {/* Resources */}
        <SettingsSection title="Resources">
          <SettingsItem
            icon={<Bookmark className="h-4 w-4" />}
            label="Saved Items"
            onClick={() => router.push("/saved")}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsItem
            icon={<HelpCircle className="h-4 w-4" />}
            label="FAQ"
            onClick={() => router.push("/settings")}
          />
          <SettingsItem
            icon={<Mail className="h-4 w-4" />}
            label="Contact Us"
            onClick={() => {
              window.location.href = "mailto:support@lingualink.app";
            }}
          />
          <SettingsItem
            icon={<Info className="h-4 w-4" />}
            label="About"
            value="v1.0.0"
            showChevron={false}
          />
        </SettingsSection>

        {/* Logout */}
        <SettingsSection>
          <SettingsItem
            icon={<LogOut className="h-4 w-4" />}
            label="Logout"
            onClick={handleLogout}
            danger
            showChevron={false}
          />
        </SettingsSection>
      </PageContainer>
    </div>
  );
}
