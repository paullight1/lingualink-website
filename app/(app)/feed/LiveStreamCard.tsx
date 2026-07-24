import { Eye, Radio } from "lucide-react";
import { GlassCard, UserAvatar } from "@/components/ui";
import type { LiveStreamRow } from "./types";

/** Minimal live-stream row card — the live product itself isn't built yet. */
export function LiveStreamCard({ stream }: { stream: LiveStreamRow }) {
  const profile = stream.profiles;
  return (
    <GlassCard intensity={20} className="flex items-center gap-3 p-4">
      <UserAvatar
        uri={profile?.avatar_url}
        name={profile?.full_name ?? profile?.username}
        size={48}
        ring
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {profile?.full_name || profile?.username || "Anonymous"}
        </p>
        <p className="truncate text-xs text-[var(--muted)]">{stream.title || "Live now"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--input)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
        <Eye className="h-3.5 w-3.5" />
        {stream.viewer_count ?? 0}
      </div>
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--error)]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--error)]">
        <Radio className="h-3 w-3" />
        Live
      </span>
    </GlassCard>
  );
}
