import { supabase } from "@/lib/supabase/client";
import { getRandomWord } from "@/lib/games/gameWords";

/**
 * TurnVerse and Word Chain game rooms.
 *
 * Ports mobile `src/services/turnVerseService.ts` and `wordChainService.ts`.
 * Both games share an identical room/player shape across two table pairs, so
 * the logic is written once and parameterized by table name. Turn durations,
 * the 6-player cap, and the 2-hour discovery window all match mobile, and
 * rooms are the same rows — a web player can join a room hosted on a phone.
 */

const MAX_PLAYERS = 6;

export type GameKind = "turnverse" | "wordchain";

/** Word Chain gives players longer, since they have to think of a word. */
const TURN_DURATION_MS: Record<GameKind, number> = {
  turnverse: 15_000,
  wordchain: 20_000,
};

const TABLES: Record<GameKind, { rooms: string; players: string; fk: string }> = {
  turnverse: {
    rooms: "turnverse_rooms",
    players: "turnverse_players",
    fk: "turnverse_rooms_host_id_fkey",
  },
  wordchain: {
    rooms: "wordchain_rooms",
    players: "wordchain_players",
    fk: "wordchain_rooms_host_id_fkey",
  },
};

export type RoomStatus = "waiting" | "active" | "finished";
export type PlayerStatus = "active" | "spectating" | "eliminated";

export interface GameRoom {
  id: string;
  host_id: string;
  title: string;
  category: string;
  language: string;
  status: RoomStatus;
  current_word: string | null;
  current_turn_index: number;
  turn_deadline: string | null;
  created_at: string;
  player_count?: number;
  host?: { username: string | null; avatar_url: string | null } | null;
  players?: GamePlayer[];
}

export interface GamePlayer {
  id: string;
  room_id: string;
  user_id: string;
  status: PlayerStatus;
  score: number;
  joined_at: string;
  profile?: {
    username: string | null;
    avatar_url: string | null;
    primary_language: string | null;
  } | null;
}

export async function createRoom(
  kind: GameKind,
  input: { title: string; category: string; language: string; userId: string }
): Promise<GameRoom | null> {
  const t = TABLES[kind];
  const { data, error } = await supabase
    .from(t.rooms)
    .insert({
      host_id: input.userId,
      title: input.title,
      category: input.category,
      language: input.language,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    console.error(`[games] ${kind} createRoom failed`, error);
    return null;
  }

  // The host is auto-seated, same as mobile.
  await joinRoom(kind, data.id, input.userId);
  return data as GameRoom;
}

/** Rooms open to join. Anything older than 2 hours is treated as stale. */
export async function getActiveRooms(kind: GameKind): Promise<GameRoom[]> {
  const t = TABLES[kind];
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from(t.rooms)
    .select(
      `*, host:profiles!${t.fk}(username, avatar_url), players:${t.players}(count)`
    )
    .in("status", ["active", "waiting"])
    .gte("created_at", twoHoursAgo)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`[games] ${kind} getActiveRooms failed`, error);
    return [];
  }

  return ((data as unknown as (GameRoom & { players?: { count: number }[] })[]) ?? []).map(
    (room) => ({
      ...room,
      player_count: room.players?.[0]?.count ?? 0,
    })
  ) as GameRoom[];
}

export async function getRoomDetails(
  kind: GameKind,
  roomId: string
): Promise<GameRoom | null> {
  const t = TABLES[kind];
  const { data, error } = await supabase
    .from(t.rooms)
    // Kept on one line: supabase-js parses the select string at the type level
    // and a newline inside it is treated as an unparseable field.
    .select(
      `*, host:profiles!${t.fk}(username, avatar_url), players:${t.players}(*, profile:profiles(username, avatar_url, primary_language))`
    )
    .eq("id", roomId)
    .maybeSingle();

  if (error) {
    console.error(`[games] ${kind} getRoomDetails failed`, error);
    return null;
  }
  return (data as unknown as GameRoom) ?? null;
}

/** Seats beyond the 6-player cap join as spectators rather than being refused. */
export async function joinRoom(
  kind: GameKind,
  roomId: string,
  userId: string
): Promise<GamePlayer | null> {
  const t = TABLES[kind];

  const { data: existing } = await supabase
    .from(t.players)
    .select("*")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return existing as GamePlayer;

  const { count } = await supabase
    .from(t.players)
    .select("*", { count: "exact", head: true })
    .eq("room_id", roomId)
    .eq("status", "active");

  const status: PlayerStatus =
    (count ?? 0) >= MAX_PLAYERS ? "spectating" : "active";

  const { data, error } = await supabase
    .from(t.players)
    .insert({ room_id: roomId, user_id: userId, status })
    .select()
    .single();

  if (error) {
    console.error(`[games] ${kind} joinRoom failed`, error);
    return null;
  }
  return data as GamePlayer;
}

export async function leaveRoom(
  kind: GameKind,
  roomId: string,
  userId: string
): Promise<void> {
  const t = TABLES[kind];
  await supabase
    .from(t.players)
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

export async function startGame(
  kind: GameKind,
  roomId: string
): Promise<void> {
  const t = TABLES[kind];
  const { data: room } = await supabase
    .from(t.rooms)
    .select("category")
    .eq("id", roomId)
    .maybeSingle();

  const { error } = await supabase
    .from(t.rooms)
    .update({
      status: "active",
      current_word: getRandomWord(room?.category || "Foods"),
      current_turn_index: 0,
      turn_deadline: new Date(Date.now() + TURN_DURATION_MS[kind]).toISOString(),
    })
    .eq("id", roomId);

  if (error) console.error(`[games] ${kind} startGame failed`, error);
}

/**
 * Pass the turn on. TurnVerse also draws a fresh word each turn; Word Chain
 * keeps the current word because the next player has to build off its last letter.
 */
export async function advanceTurn(
  kind: GameKind,
  roomId: string,
  playerCount: number
): Promise<void> {
  if (playerCount <= 0) return;
  const t = TABLES[kind];

  const { data: room } = await supabase
    .from(t.rooms)
    .select("current_turn_index, category")
    .eq("id", roomId)
    .maybeSingle();
  if (!room) return;

  const update: Record<string, unknown> = {
    current_turn_index: (room.current_turn_index + 1) % playerCount,
    turn_deadline: new Date(Date.now() + TURN_DURATION_MS[kind]).toISOString(),
  };
  if (kind === "turnverse") {
    update.current_word = getRandomWord(room.category || "Foods");
  }

  const { error } = await supabase.from(t.rooms).update(update).eq("id", roomId);
  if (error) console.error(`[games] ${kind} advanceTurn failed`, error);
}

export async function endGame(
  kind: GameKind,
  roomId: string
): Promise<void> {
  const t = TABLES[kind];
  const { error } = await supabase
    .from(t.rooms)
    .update({ status: "finished" })
    .eq("id", roomId);
  if (error) console.error(`[games] ${kind} endGame failed`, error);
}

/**
 * Word Chain move: the submitted word must start with the last letter of the
 * current word. Scoring goes through the shared `award_wordchain_points` RPC.
 */
export async function submitWord(
  roomId: string,
  userId: string,
  word: string,
  currentWord: string,
  nextIndex: number
): Promise<{ success: boolean; message?: string }> {
  const clean = word.trim().toLowerCase();
  const current = currentWord.trim().toLowerCase();
  const requiredLetter = current[current.length - 1];

  if (!clean) return { success: false, message: "Enter a word." };
  if (clean[0] !== requiredLetter) {
    return {
      success: false,
      message: `Word must start with '${requiredLetter.toUpperCase()}'`,
    };
  }

  const { error } = await supabase
    .from("wordchain_rooms")
    .update({
      current_word: word.trim(),
      current_turn_index: nextIndex,
      turn_deadline: new Date(
        Date.now() + TURN_DURATION_MS.wordchain
      ).toISOString(),
    })
    .eq("id", roomId);
  if (error) throw error;

  await supabase.rpc("award_wordchain_points", {
    p_room_id: roomId,
    p_user_id: userId,
    p_points: 10,
  });

  return { success: true };
}

export function turnDurationMs(kind: GameKind): number {
  return TURN_DURATION_MS[kind];
}
