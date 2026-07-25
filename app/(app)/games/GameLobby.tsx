"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Globe, Plus, Users } from "lucide-react";
import toast from "react-hot-toast";

import {
  AppHeader,
  EmptyState,
  Field,
  GlassCard,
  Input,
  ModalSheet,
  PrimaryButton,
  Select,
  Skeleton,
  UserAvatar,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId, useLanguages, uniqueLanguageNames } from "@/lib/query/hooks";
import { useRealtime } from "@/lib/query/useRealtime";
import { GAME_CATEGORIES } from "@/lib/games/gameWords";
import {
  createRoom,
  getActiveRooms,
  joinRoom,
  type GameKind,
  type GameRoom,
} from "@/lib/api/games";
import { cn } from "@/lib/utils";

/**
 * Shared lobby for both games: list open rooms, create one, or join.
 * Rooms come from the same tables the mobile app writes, so a room hosted on
 * a phone shows up here and vice versa.
 */
export function GameLobby({
  kind,
  title,
  blurb,
}: {
  kind: GameKind;
  title: string;
  blurb: string;
}) {
  const router = useRouter();
  const currentUserId = useCurrentUserId();
  const { data: languages } = useLanguages();

  const [createOpen, setCreateOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [category, setCategory] = useState<string>(GAME_CATEGORIES[0]);
  const [language, setLanguage] = useState("English");
  const [busy, setBusy] = useState(false);

  const roomsQuery = useQuery({
    queryKey: ["game-rooms", kind],
    queryFn: () => getActiveRooms(kind),
    refetchInterval: 15_000,
  });

  useRealtime(
    `${kind}-lobby`,
    [{ table: `${kind}_rooms` }],
    () => roomsQuery.refetch()
  );

  const handleCreate = async () => {
    if (!currentUserId || !roomTitle.trim() || busy) return;
    setBusy(true);
    try {
      const room = await createRoom(kind, {
        title: roomTitle.trim(),
        category,
        language,
        userId: currentUserId,
      });
      if (!room) throw new Error("Room was not created");
      setCreateOpen(false);
      setRoomTitle("");
      router.push(`/games/${kind}/${room.id}`);
    } catch (err) {
      console.error(`[games] ${kind} create failed`, err);
      toast.error("Couldn't create that room");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (room: GameRoom) => {
    if (!currentUserId || busy) return;
    setBusy(true);
    try {
      const player = await joinRoom(kind, room.id, currentUserId);
      if (!player) throw new Error("Could not join");
      router.push(`/games/${kind}/${room.id}`);
    } catch (err) {
      console.error(`[games] ${kind} join failed`, err);
      toast.error("Couldn't join that room");
      setBusy(false);
    }
  };

  const rooms = roomsQuery.data ?? [];

  return (
    <div className="min-h-full">
      <AppHeader
        title={title}
        showBack
        onBack={() => router.push("/games")}
        rightElement={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label="Create room"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow"
          >
            <Plus className="h-4 w-4" />
          </button>
        }
      />

      <PageContainer size="sm" className="pb-8">
        <p className="mb-4 text-sm text-[var(--muted)]">{blurb}</p>

        {roomsQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-[16px]" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={<Users className="h-7 w-7" />}
            title="No open rooms"
            message="Start one and invite your friends."
            action={
              <PrimaryButton fullWidth={false} onClick={() => setCreateOpen(true)}>
                Create a room
              </PrimaryButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {rooms.map((room) => (
              <GlassCard key={room.id} className="flex items-center gap-3 p-4">
                <UserAvatar
                  uri={room.host?.avatar_url ?? undefined}
                  name={room.host?.username ?? "Host"}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--foreground)]">
                    {room.title}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {room.category} · {room.language} · {room.player_count ?? 0}/6
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                    room.status === "active"
                      ? "bg-[var(--success)]/15 text-[var(--success)]"
                      : "bg-[var(--warning)]/15 text-[var(--warning)]"
                  )}
                >
                  {room.status === "active" ? "In play" : "Waiting"}
                </span>
                <button
                  type="button"
                  onClick={() => handleJoin(room)}
                  disabled={busy}
                  className="shrink-0 rounded-full bg-brand-gradient px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  Join
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </PageContainer>

      {createOpen && (
        <ModalSheet
          onClose={() => setCreateOpen(false)}
          title={`New ${title} room`}
          size="md"
          footer={
            <PrimaryButton
              loading={busy}
              disabled={!roomTitle.trim() || busy}
              onClick={handleCreate}
            >
              Create room
            </PrimaryButton>
          }
        >
          <div className="flex flex-col gap-4">
            <Field label="Room name" counter={{ value: roomTitle.length, max: 50 }}>
              <Input
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                maxLength={50}
                placeholder="Friday night practice"
              />
            </Field>

            <div>
              <p className="mb-2 text-[13px] font-semibold text-[var(--foreground)]">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {GAME_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-[12px] font-semibold transition",
                      category === c
                        ? "bg-brand-gradient text-white shadow-glow"
                        : "bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Language">
              <Select
                icon={Globe}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {uniqueLanguageNames(languages).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </ModalSheet>
      )}
    </div>
  );
}
