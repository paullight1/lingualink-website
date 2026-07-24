import { Award } from "lucide-react";
import type { UserBadge } from "@/lib/types";

/** Tier accent colors — mirrors the mobile TrophyCase's bronze/silver/gold tiering. */
const TIER_COLORS: Record<string, { from: string; to: string; text: string }> = {
  bronze: { from: "#CD7F32", to: "#8C5A28", text: "#2b1707" },
  silver: { from: "#E4E4E4", to: "#A8A8A8", text: "#26282b" },
  gold: { from: "#FFD700", to: "#FFA500", text: "#1a1a1a" },
  platinum: { from: "#E5E4E2", to: "#B9B8B6", text: "#1a1a1a" },
  diamond: { from: "#B9F2FF", to: "#5FC9E8", text: "#0a2a33" },
};

/** Single earned-badge tile for the Badges grid — icon in a tier-colored medallion. */
export function BadgeCard({ badge }: { badge: UserBadge }) {
  const tier = TIER_COLORS[badge.tier] ?? TIER_COLORS.bronze;

  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] border border-[var(--border-light)] bg-[var(--surface)] p-4 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full text-xl shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${tier.from}, ${tier.to})`,
          color: tier.text,
        }}
      >
        {badge.icon ? <span aria-hidden>{badge.icon}</span> : <Award className="h-6 w-6" />}
      </div>
      <span className="line-clamp-2 text-xs font-semibold text-[var(--foreground)]">
        {badge.name}
      </span>
      {badge.tier && (
        <span
          className="text-[10px] font-bold uppercase tracking-wide"
          style={{ color: tier.from }}
        >
          {badge.tier}
        </span>
      )}
    </div>
  );
}
