"use client";

/** Chat thread — DM or group. Realtime messages, text + voice, read receipts. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MessageSquare, Phone, Users, Info, Video } from "lucide-react";
import toast from "react-hot-toast";

import { EmptyState, Spinner, UserAvatar } from "@/components/ui";
import { useCurrentUserId, useMyProfile } from "@/lib/query/hooks";
import { useRealtime } from "@/lib/query/useRealtime";
import { callSignaling } from "@/lib/api/callSignaling";
import { generateCallId, logCallStart } from "@/lib/api/live";
import {
  getConversation,
  getGroupMembers,
  getMessages,
  getOtherParticipant,
  markConversationRead,
  sendTextMessage,
  sendVoiceMessage,
  type ChatMessage,
} from "@/lib/api/chat";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

/** Groups messages by calendar day for the date separators. */
function groupByDay(messages: ChatMessage[]) {
  const groups: { label: string; items: ChatMessage[] }[] = [];
  for (const message of messages) {
    const date = new Date(message.created_at);
    const label = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    });
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(message);
    else groups.push({ label, items: [message] });
  }
  return groups;
}

export default function ChatThreadPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const { data: myProfile } = useMyProfile();

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [pending, setPending] = useState<ChatMessage[]>([]);

  const conversationQuery = useQuery({
    queryKey: ["conversation", conversationId],
    enabled: !!conversationId,
    queryFn: () => getConversation(conversationId),
  });
  const conversation = conversationQuery.data;
  const isGroup = !!conversation?.is_group;

  const peerQuery = useQuery({
    queryKey: ["conversation-peer", conversationId],
    enabled: !!conversationId && conversationQuery.isSuccess && !isGroup,
    queryFn: () => getOtherParticipant(conversationId),
  });

  const membersQuery = useQuery({
    queryKey: ["group-members", conversationId],
    enabled: !!conversationId && isGroup,
    queryFn: () => getGroupMembers(conversationId),
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: () => getMessages(conversationId),
  });

  const messages = useMemo(() => messagesQuery.data ?? [], [messagesQuery.data]);

  // Mirrors the mobile `chat:{conversationId}` channel.
  useRealtime(
    `chat:${conversationId}`,
    [
      {
        table: "messages",
        event: "INSERT",
        filter: `conversation_id=eq.${conversationId}`,
      },
    ],
    () => messagesQuery.refetch()
  );

  // Drop optimistic rows once the real ones land.
  useEffect(() => {
    if (pending.length === 0) return;
    const realIds = new Set(messages.map((m) => m.id));
    setPending((prev) =>
      prev.filter((p) => !realIds.has(p.id) && !messages.some((m) => m.id === p.id))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending.length]);

  // Clear the unread badge as soon as the thread is open.
  useEffect(() => {
    if (conversationId && currentUserId) {
      markConversationRead(conversationId, currentUserId);
    }
  }, [conversationId, currentUserId, messages.length]);

  const memberById = useMemo(
    () => new Map((membersQuery.data ?? []).map((m) => [m.id, m])),
    [membersQuery.data]
  );

  const handleSendText = useCallback(
    async (text: string) => {
      if (!currentUserId) return;
      const optimistic: ChatMessage = {
        id: `pending-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: currentUserId,
        text,
        type: "text",
        media_url: null,
        created_at: new Date().toISOString(),
      };
      setPending((prev) => [...prev, optimistic]);
      try {
        await sendTextMessage(conversationId, currentUserId, text);
        await messagesQuery.refetch();
      } catch (err) {
        setPending((prev) => prev.filter((p) => p.id !== optimistic.id));
        throw err;
      }
    },
    [conversationId, currentUserId, messagesQuery]
  );

  const handleSendVoice = useCallback(
    async (blob: Blob) => {
      if (!currentUserId) return;
      await sendVoiceMessage(conversationId, currentUserId, blob);
      await messagesQuery.refetch();
    },
    [conversationId, currentUserId, messagesQuery]
  );

  const peer = peerQuery.data;
  const title = isGroup
    ? conversation?.title || "Group"
    : peer?.full_name || peer?.username || "Conversation";

  /**
   * Ring the other participant, then open the call room. The room name is
   * derived from both user ids so the callee lands in the same LiveKit room.
   */
  const startCall = async (callType: "voice" | "video") => {
    if (!currentUserId || !peer?.id) return;
    const callId = generateCallId(currentUserId, peer.id);
    try {
      await callSignaling.startCall({
        callId,
        receiverId: peer.id,
        callerName: myProfile?.full_name || myProfile?.username || "LinguaLink user",
        callerAvatar: myProfile?.avatar_url ?? undefined,
        callType,
      });
      await logCallStart({
        callId,
        callerId: currentUserId,
        receiverId: peer.id,
        callType,
      });
      router.push(`/call/${callId}?type=${callType}&peer=${peer.id}&role=caller`);
    } catch (err) {
      console.error("[chat] could not start call", err);
      toast.error("Couldn't start the call");
    }
  };

  const allMessages = useMemo(
    () => [...messages, ...pending],
    [messages, pending]
  );
  const dayGroups = useMemo(() => groupByDay(allMessages), [allMessages]);

  return (
    <div className="flex h-dvh flex-col md:h-[100dvh]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-[var(--border-light)] bg-[var(--background)]/85 px-3 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.push("/chat")}
          aria-label="Back to chats"
          className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {isGroup ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple)]">
            <Users className="h-5 w-5" />
          </span>
        ) : (
          <Link href={peer ? `/u/${peer.id}` : "#"} className="shrink-0">
            <UserAvatar
              uri={peer?.avatar_url ?? undefined}
              name={title}
              size={40}
            />
          </Link>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--foreground)]">
            {title}
          </p>
          <p className="truncate text-xs text-[var(--muted)]">
            {isGroup
              ? `${membersQuery.data?.length ?? 0} members`
              : peer?.primary_language || ""}
          </p>
        </div>

        {isGroup ? (
          <Link
            href={`/groups/${conversationId}`}
            aria-label="Group info"
            className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--foreground)]"
          >
            <Info className="h-5 w-5" />
          </Link>
        ) : (
          peer && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => startCall("voice")}
                aria-label="Voice call"
                className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--color-primary)]"
              >
                <Phone className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => startCall("video")}
                aria-label="Video call"
                className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[var(--input)] hover:text-[var(--color-primary)]"
              >
                <Video className="h-5 w-5" />
              </button>
            </div>
          )
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {messagesQuery.isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : allMessages.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-7 w-7" />}
            title="No messages yet"
            message={`Say hello to ${title}.`}
          />
        ) : (
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {dayGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                <div className="my-2 flex justify-center">
                  <span className="rounded-full bg-[var(--input)] px-3 py-1 text-[11px] font-medium text-[var(--muted)]">
                    {group.label}
                  </span>
                </div>
                {group.items.map((message) => {
                  const sender = memberById.get(message.sender_id);
                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isMine={message.sender_id === currentUserId}
                      showSender={isGroup}
                      senderName={
                        sender?.full_name || sender?.username || undefined
                      }
                      senderAvatar={sender?.avatar_url}
                      pending={message.id.startsWith("pending-")}
                    />
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageComposer
        onSendText={handleSendText}
        onSendVoice={handleSendVoice}
        disabled={!currentUserId}
      />
    </div>
  );
}
