"use client";

import { UserAvatar, WaveformPlayer } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/api/chat";

/** One message row. Voice messages render the shared waveform player. */
export interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  /** Group threads label who's speaking; DMs don't need it. */
  showSender?: boolean;
  senderName?: string;
  senderAvatar?: string | null;
  /** Not yet acknowledged by the server. */
  pending?: boolean;
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isMine,
  showSender = false,
  senderName,
  senderAvatar,
  pending = false,
}: MessageBubbleProps) {
  const isVoice = message.type === "voice" && !!message.media_url;

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isMine ? "justify-end" : "justify-start"
      )}
    >
      {!isMine && showSender && (
        <UserAvatar
          uri={senderAvatar ?? undefined}
          name={senderName || "User"}
          size={28}
        />
      )}

      <div
        className={cn(
          "max-w-[78%] rounded-[18px] px-3.5 py-2.5",
          isMine
            ? "rounded-br-md bg-brand-gradient text-white"
            : "rounded-bl-md bg-[var(--input)] text-[var(--foreground)]",
          pending && "opacity-60"
        )}
      >
        {!isMine && showSender && senderName && (
          <p className="mb-0.5 text-xs font-semibold text-[var(--color-primary)]">
            {senderName}
          </p>
        )}

        {isVoice ? (
          <div className="min-w-[180px]">
            <WaveformPlayer src={message.media_url} seed={message.id} compact />
          </div>
        ) : message.type === "image" && message.media_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.media_url}
            alt=""
            className="max-h-72 rounded-[12px] object-cover"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px]">
            {message.text}
          </p>
        )}

        <p
          className={cn(
            "mt-1 text-right text-[10px] tabular-nums",
            isMine ? "text-white/70" : "text-[var(--muted)]"
          )}
        >
          {pending ? "Sending…" : clockTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
