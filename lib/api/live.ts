import { authFetch, parseResponse } from "./authFetch";
import { supabase } from "@/lib/supabase/client";

/**
 * LiveKit token + stream lifecycle, and 1:1 call history.
 *
 * Ports mobile `src/services/liveService.ts` and `src/services/calling.ts`.
 * Both clients hit the same NestJS `/live/*` endpoints and write the same
 * `call_history` rows, so a call placed from the web shows up in the mobile
 * history and vice versa.
 */

const TOKEN_TIMEOUT_MS = 15_000;
const MAX_TOKEN_RETRIES = 3;
const RETRY_DELAY_BASE_MS = 1000;

export interface LiveTokenResponse {
  token: string;
  serverUrl: string;
}

export interface LiveStream {
  id: string;
  title: string;
  viewerCount: string;
  streamerId: string;
  username: string | null;
  avatarUrl: string | null;
}

export class LiveError extends Error {
  code: string;
  isRetryable: boolean;

  constructor(message: string, code: string, isRetryable = true) {
    super(message);
    this.name = "LiveError";
    this.code = code;
    this.isRetryable = isRetryable;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Request a LiveKit join token. Retries on timeout and 5xx with exponential
 * backoff, matching the mobile retry policy.
 */
export async function requestLiveToken(
  roomName: string,
  participantName: string,
  attempt = 0
): Promise<LiveTokenResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TOKEN_TIMEOUT_MS);

  try {
    const response = await authFetch("/live/token", {
      method: "POST",
      body: JSON.stringify({ roomName, participantName }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new LiveError(
          "Session expired. Please sign in again.",
          "AUTH_ERROR",
          false
        );
      }
      if (response.status === 404) {
        throw new LiveError("Call service not found.", "NOT_FOUND", false);
      }
      if (response.status >= 500) {
        throw new LiveError(
          "Call server is temporarily unavailable.",
          "SERVER_ERROR",
          true
        );
      }
    }

    return await parseResponse<LiveTokenResponse>(response);
  } catch (err) {
    clearTimeout(timeoutId);

    const isAbort = err instanceof Error && err.name === "AbortError";
    const retryable =
      isAbort || (err instanceof LiveError ? err.isRetryable : true);

    if (retryable && attempt < MAX_TOKEN_RETRIES) {
      await sleep(RETRY_DELAY_BASE_MS * 2 ** attempt);
      return requestLiveToken(roomName, participantName, attempt + 1);
    }

    if (err instanceof LiveError) throw err;
    throw new LiveError(
      isAbort
        ? "Connection timed out."
        : err instanceof Error
        ? err.message
        : "Could not reach the call server.",
      isAbort ? "TIMEOUT" : "UNKNOWN_ERROR",
      false
    );
  }
}

/* ── Live streams ───────────────────────────────────────────────── */

export async function startStream(
  title: string,
  language = "English"
): Promise<{ roomId: string }> {
  return parseResponse(
    await authFetch("/live/start", {
      method: "POST",
      body: JSON.stringify({ title, language }),
    })
  );
}

export async function endStream(roomId: string): Promise<void> {
  await authFetch("/live/end", {
    method: "POST",
    body: JSON.stringify({ roomId }),
  });
}

export async function getActiveStreams(): Promise<LiveStream[]> {
  return parseResponse(await authFetch("/live/discover"));
}

/* ── Call identity + history ────────────────────────────────────── */

/**
 * Deterministic room name for a 1:1 call — sorted so both sides derive the
 * same id regardless of who dials.
 */
export function generateCallId(userA: string, userB: string): string {
  return [userA, userB].sort().join("_");
}

export type CallType = "voice" | "video" | "group";
export type CallHistoryStatus =
  | "initiated"
  | "ringing"
  | "answered"
  | "ended"
  | "missed"
  | "declined";

/**
 * Shape of the live `call_history` table. Verified against the database — it
 * is NOT the shape in `supabase/migrations/20240129_add_call_history.sql`:
 * the deployed table keys on `room_id` and has no `call_type`, `answered_at`,
 * `duration_seconds` or `end_reason` columns. Writing those fails the insert
 * outright, so everything below sticks to columns that actually exist.
 */
export interface CallHistoryRecord {
  id: string;
  room_id: string;
  caller_id: string;
  receiver_id: string;
  status: CallHistoryStatus;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export async function logCallStart(input: {
  callId: string;
  callerId: string;
  receiverId: string;
  callType: CallType;
}): Promise<void> {
  try {
    // `callId` is the LiveKit room name, which is what `room_id` stores.
    await supabase.from("call_history").insert({
      room_id: input.callId,
      caller_id: input.callerId,
      receiver_id: input.receiverId,
      status: "ringing",
      started_at: new Date().toISOString(),
    });
  } catch (err) {
    // History is best-effort; never block the call on it.
    console.error("[live] logCallStart failed", err);
  }
}

export async function logCallAnswered(callId: string): Promise<void> {
  try {
    await supabase
      .from("call_history")
      .update({ status: "answered" })
      .eq("room_id", callId)
      .is("ended_at", null);
  } catch (err) {
    console.error("[live] logCallAnswered failed", err);
  }
}

/**
 * `endReason` is kept in the signature because callers reason in those terms,
 * but the table has no column for it — it only narrows the final status.
 */
export async function logCallEnd(
  callId: string,
  endReason: string
): Promise<void> {
  try {
    const status: CallHistoryStatus =
      endReason === "missed"
        ? "missed"
        : endReason === "declined"
        ? "declined"
        : "ended";

    await supabase
      .from("call_history")
      .update({ status, ended_at: new Date().toISOString() })
      .eq("room_id", callId)
      .is("ended_at", null);
  } catch (err) {
    console.error("[live] logCallEnd failed", err);
  }
}

export async function getCallHistory(): Promise<CallHistoryRecord[]> {
  const { data, error } = await supabase
    .from("call_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[live] call history fetch failed", error);
    return [];
  }
  return (data as CallHistoryRecord[] | null) ?? [];
}
