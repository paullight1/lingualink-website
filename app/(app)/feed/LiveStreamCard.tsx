import Link from "next/link";
import { Eye, Radio } from "lucide-react";
import { GlassCard, UserAvatar } from "@/components/ui";
import type { LiveStream } from "@/lib/api/live";

/** A currently-live stream. Tapping through joins the room as a viewer. */
export function LiveStreamCard({ stream }: { stream: LiveStream }) {
  const name = stream.username || "Anonymous";
  return (
    <Link href={`/live/${stream.id}`}>
      <GlassCard intensity={20} className="flex items-center gap-3 p-4 transition hover:brightness-110">
        <UserAvatar uri={stream.avatarUrl ?? undefined} name={name} size={48} ring />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
            {name}
          </p>
          <p className="truncate text-xs text-[var(--muted)]">
            {stream.title || "Live now"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--input)] px-2.5 py-1 text-xs font-medium text-[var(--muted)]">
          <Eye className="h-3.5 w-3.5" />
          {stream.viewerCount ?? 0}
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--error)]/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--error)]">
          <Radio className="h-3 w-3" />
          Live
        </span>
      </GlassCard>
    </Link>
  );
}
