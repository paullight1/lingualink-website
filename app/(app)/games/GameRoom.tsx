"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Crown, LogOut, Play, Send, Timer, Users } from "lucide-react";
import toast from "react-hot-toast";

import {
  AppHeader,
  EmptyState,
  GlassCard,
  Input,
  PrimaryButton,
  Spinner,
  UserAvatar,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId } from "@/lib/query/hooks";
import { useRealtime } from "@/lib/query/useRealtime";
import {
  advanceTurn,
  endGame,
  getRoomDetails,
  leaveRoom,
  startGame,
  submitWord,
  type GameKind,
} from "@/lib/api/games";
import { cn } from "@/lib/utils";

/**
 * Live game room, shared by TurnVerse and Word Chain.
 *
 * Turn order is `current_turn_index` into the active-player list, and the
 * deadline lives on the room row — the same server-side state the mobile
 * screens read, so both clients agree on whose turn it is.
 */
export function GameRoom({ kind, roomId }: { kind: GameKind; roomId: string }) {
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [guess, setGuess] = useState("");
  const [busy, setBusy] = useState(false);

  const roomQuery = useQuery({
    queryKey: ["game-room", kind, roomId],
    enabled: !!roomId,
    queryFn: () => getRoomDetails(kind, roomId),
  });

  const room = roomQuery.data;

  // Any room or player change re-renders the board for everyone.
  useRealtime(
    `${kind}-room-${roomId}`,
    [
      { table: `${kind}_rooms`, filter: `id=eq.${roomId}` },
      { table: `${kind}_players`, filter: `room_id=eq.${roomId}` },
    ],
    () => roomQuery.refetch()
  );

  // Spectators don't hold a seat in the turn rotation.
  const activePlayers = useMemo(
    () => (room?.players ?? []).filter((p) => p.status === "active"),
    [room?.players]
  );

  const currentPlayer = activePlayers.length
    ? activePlayers[room!.current_turn_index % activePlayers.length]
    : undefined;
  const isMyTurn = !!currentUserId && currentPlayer?.user_id === currentUserId;
  const isHost = !!currentUserId && room?.host_id === currentUserId;
  const isPlaying = room?.status === "active";

  // Countdown to the shared deadline.
  useEffect(() => {
    if (!room?.turn_deadline || !isPlaying) {
      setSecondsLeft(0);
      return;
    }
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(room.turn_deadline as string).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
    };
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [room?.turn_deadline, isPlaying]);

  // When your own turn expires, pass it on. Only the player whose turn it is
  // writes, so the room isn't advanced several times by several clients.
  useEffect(() => {
    if (!isPlaying || !isMyTurn || secondsLeft > 0 || !room?.turn_deadline) return;
    advanceTurn(kind, roomId, activePlayers.length).then(() => roomQuery.refetch());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isMyTurn, isPlaying]);

  const handleStart = async () => {
    setBusy(true);
    try {
      await startGame(kind, roomId);
      await roomQuery.refetch();
    } finally {
      setBusy(false);
    }
  };

  const handlePass = async () => {
    setBusy(true);
    try {
      await advanceTurn(kind, roomId, activePlayers.length);
      await roomQuery.refetch();
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitWord = async () => {
    if (!currentUserId || !room?.current_word || !guess.trim() || busy) return;
    setBusy(true);
    try {
      const nextIndex =
        (room.current_turn_index + 1) % Math.max(1, activePlayers.length);
      const result = await submitWord(
        roomId,
        currentUserId,
        guess,
        room.current_word,
        nextIndex
      );
      if (!result.success) {
        toast.error(result.message ?? "That word doesn't work");
        return;
      }
      setGuess("");
      await roomQuery.refetch();
    } catch (err) {
      console.error("[games] submitWord failed", err);
      toast.error("Couldn't submit that word");
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = useCallback(async () => {
    if (!currentUserId) return;
    if (isHost && isPlaying) await endGame(kind, roomId);
    await leaveRoom(kind, roomId, currentUserId);
    router.push(`/games/${kind}`);
  }, [currentUserId, isHost, isPlaying, kind, roomId, router]);

  if (roomQuery.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!room) {
    return (
      <PageContainer size="sm">
        <EmptyState
          title="Room not found"
          message="This game may have already finished."
          action={
            <PrimaryButton onClick={() => router.push(`/games/${kind}`)}>
              Back to lobby
            </PrimaryButton>
          }
        />
      </PageContainer>
    );
  }

  const requiredLetter =
    kind === "wordchain" && room.current_word
      ? room.current_word.trim().slice(-1).toUpperCase()
      : null;

  return (
    <div className="min-h-full">
      <AppHeader
        title={room.title}
        showBack
        onBack={handleLeave}
        rightElement={
          <span className="flex items-center gap-1 text-sm font-medium text-[var(--muted)]">
            <Users className="h-4 w-4" />
            {activePlayers.length}/6
          </span>
        }
      />

      <PageContainer size="sm" className="pb-8">
        {/* Board */}
        <GlassCard className="mb-5 flex flex-col items-center gap-3 p-6 text-center">
          {isPlaying ? (
            <>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums",
                  secondsLeft <= 5
                    ? "bg-[var(--error)]/15 text-[var(--error)]"
                    : "bg-[var(--input)] text-[var(--muted)]"
                )}
              >
                <Timer className="h-3.5 w-3.5" />
                {secondsLeft}s
              </span>

              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {kind === "wordchain" ? "Current word" : "Say this in your language"}
              </p>
              <p className="text-3xl font-extrabold text-[var(--foreground)]">
                {room.current_word ?? "—"}
              </p>

              {requiredLetter && (
                <p className="text-sm text-[var(--muted)]">
                  Next word starts with{" "}
                  <span className="font-bold text-[var(--color-primary)]">
                    {requiredLetter}
                  </span>
                </p>
              )}

              <p
                className={cn(
                  "mt-1 text-sm font-semibold",
                  isMyTurn ? "text-[var(--color-primary)]" : "text-[var(--muted)]"
                )}
              >
                {isMyTurn
                  ? "Your turn!"
                  : `${currentPlayer?.profile?.username ?? "Someone"}'s turn`}
              </p>
            </>
          ) : room.status === "finished" ? (
            <>
              <p className="text-lg font-bold text-[var(--foreground)]">
                Game over
              </p>
              <p className="text-sm text-[var(--muted)]">Thanks for playing!</p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-[var(--foreground)]">
                Waiting for players
              </p>
              <p className="text-sm text-[var(--muted)]">
                {room.category} · {room.language}
              </p>
              {isHost ? (
                <PrimaryButton
                  className="mt-2"
                  fullWidth={false}
                  loading={busy}
                  disabled={activePlayers.length < 1 || busy}
                  onClick={handleStart}
                  leftIcon={<Play className="h-4 w-4" />}
                >
                  Start game
                </PrimaryButton>
              ) : (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  The host will start the game.
                </p>
              )}
            </>
          )}
        </GlassCard>

        {/* Turn actions */}
        {isPlaying && isMyTurn && (
          <div className="mb-5">
            {kind === "wordchain" ? (
              <div className="flex items-end gap-2">
                <Input
                  size="md"
                  autoFocus
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmitWord();
                  }}
                  aria-label="Your word"
                  placeholder={
                    requiredLetter ? `Word starting with ${requiredLetter}…` : "Your word…"
                  }
                  wrapperClassName="flex-1 rounded-full"
                />
                <button
                  type="button"
                  onClick={handleSubmitWord}
                  disabled={!guess.trim() || busy}
                  aria-label="Submit word"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <PrimaryButton loading={busy} onClick={handlePass}>
                Done — next player
              </PrimaryButton>
            )}
          </div>
        )}

        {/* Players */}
        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          Players
        </h2>
        <ul className="flex flex-col">
          {(room.players ?? []).map((player) => {
            const isTurn = player.user_id === currentPlayer?.user_id && isPlaying;
            return (
              <li
                key={player.id}
                className={cn(
                  "flex items-center gap-3 rounded-[16px] px-2 py-2.5",
                  isTurn && "bg-[var(--color-primary)]/10"
                )}
              >
                <UserAvatar
                  uri={player.profile?.avatar_url ?? undefined}
                  name={player.profile?.username ?? "Player"}
                  size={40}
                  ring={isTurn}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate font-semibold text-[var(--foreground)]">
                      {player.profile?.username ?? "Player"}
                    </span>
                    {player.user_id === room.host_id && (
                      <Crown className="h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
                    )}
                  </span>
                  <span className="block text-xs text-[var(--muted)]">
                    {player.status === "spectating" ? "Spectating" : `${player.score ?? 0} pts`}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={handleLeave}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--error)]/40 px-5 py-3 text-sm font-semibold text-[var(--error)] transition hover:bg-[var(--error)]/10"
        >
          <LogOut className="h-4 w-4" />
          {isHost && isPlaying ? "End game and leave" : "Leave room"}
        </button>
      </PageContainer>
    </div>
  );
}
