import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

/**
 * Real-time call signaling over Supabase broadcast.
 *
 * Channel names and event payloads are identical to mobile
 * `src/services/callSignaling.ts`, so a web user can ring a phone and vice
 * versa:
 *   - `calls:{userId}`   — per-user inbox: `incoming_call`, `call_cancelled`
 *   - `call:{callId}`    — per-call: `call_accepted`, `call_declined`, `call_ended`
 */

export type CallType = "voice" | "video";
export type CallStatus =
  | "ringing"
  | "accepted"
  | "declined"
  | "ended"
  | "missed"
  | "busy";

export interface CallSignal {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  callType: CallType;
  status: CallStatus;
  timestamp: number;
}

export interface CallSignalingCallbacks {
  onIncomingCall?: (signal: CallSignal) => void;
  onCallAccepted?: (signal: CallSignal) => void;
  onCallDeclined?: (signal: CallSignal) => void;
  onCallEnded?: (signal: CallSignal) => void;
  onCallCancelled?: (signal: CallSignal) => void;
  onCallMissed?: (signal: CallSignal) => void;
}

/** Unanswered calls give up after this long, matching mobile. */
const RING_TIMEOUT_MS = 30_000;

class CallSignalingService {
  private userChannel: RealtimeChannel | null = null;
  private activeCallChannel: RealtimeChannel | null = null;
  private currentUserId: string | null = null;
  private callbacks: CallSignalingCallbacks = {};
  private activeCall: CallSignal | null = null;
  private ringTimeout: ReturnType<typeof setTimeout> | null = null;

  /** Subscribe to this user's call inbox. Safe to call repeatedly. */
  async initialize(userId: string, callbacks: CallSignalingCallbacks) {
    if (this.currentUserId === userId && this.userChannel) {
      this.callbacks = callbacks;
      return;
    }
    await this.teardownUserChannel();

    this.currentUserId = userId;
    this.callbacks = callbacks;

    this.userChannel = supabase
      .channel(`calls:${userId}`, {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "incoming_call" }, ({ payload }) => {
        this.callbacks.onIncomingCall?.(payload as CallSignal);
      })
      .on("broadcast", { event: "call_cancelled" }, ({ payload }) => {
        this.callbacks.onCallCancelled?.(payload as CallSignal);
      });

    await this.userChannel.subscribe();
  }

  private async teardownUserChannel() {
    if (this.userChannel) {
      await supabase.removeChannel(this.userChannel);
      this.userChannel = null;
    }
  }

  private clearRingTimeout() {
    if (this.ringTimeout) clearTimeout(this.ringTimeout);
    this.ringTimeout = null;
  }

  /** Listen on the per-call channel for the other side's response. */
  private async subscribeToCallChannel(callId: string) {
    if (this.activeCallChannel) {
      await supabase.removeChannel(this.activeCallChannel);
      this.activeCallChannel = null;
    }

    this.activeCallChannel = supabase
      .channel(`call:${callId}`)
      .on("broadcast", { event: "call_accepted" }, ({ payload }) => {
        this.clearRingTimeout();
        if (this.activeCall) this.activeCall.status = "accepted";
        this.callbacks.onCallAccepted?.(payload as CallSignal);
      })
      .on("broadcast", { event: "call_declined" }, ({ payload }) => {
        this.clearRingTimeout();
        if (this.activeCall) this.activeCall.status = "declined";
        this.callbacks.onCallDeclined?.(payload as CallSignal);
      })
      .on("broadcast", { event: "call_ended" }, ({ payload }) => {
        this.clearRingTimeout();
        if (this.activeCall) this.activeCall.status = "ended";
        this.callbacks.onCallEnded?.(payload as CallSignal);
      });

    await this.activeCallChannel.subscribe();
  }

  /** Ring `receiverId`. Resolves once the invite has been broadcast. */
  async startCall(input: {
    callId: string;
    receiverId: string;
    callerName: string;
    callerAvatar?: string;
    callType: CallType;
  }): Promise<CallSignal | null> {
    if (!this.currentUserId) return null;

    const signal: CallSignal = {
      callId: input.callId,
      callerId: this.currentUserId,
      callerName: input.callerName,
      callerAvatar: input.callerAvatar,
      receiverId: input.receiverId,
      callType: input.callType,
      status: "ringing",
      timestamp: Date.now(),
    };
    this.activeCall = signal;

    await this.subscribeToCallChannel(input.callId);

    // One-shot channel just to deliver the invite to the receiver's inbox.
    const receiverChannel = supabase.channel(`calls:${input.receiverId}`);
    await receiverChannel.subscribe();
    try {
      await receiverChannel.send({
        type: "broadcast",
        event: "incoming_call",
        payload: signal,
      });
    } catch (err) {
      console.error("[callSignaling] failed to ring receiver", err);
    } finally {
      await supabase.removeChannel(receiverChannel);
    }

    this.clearRingTimeout();
    this.ringTimeout = setTimeout(() => {
      if (this.activeCall?.status === "ringing") {
        this.callbacks.onCallMissed?.(this.activeCall);
        this.endCall("missed");
      }
    }, RING_TIMEOUT_MS);

    return signal;
  }

  /** Accept an incoming call and tell the caller. */
  async acceptCall(signal: CallSignal): Promise<void> {
    this.activeCall = { ...signal, status: "accepted" };
    await this.subscribeToCallChannel(signal.callId);
    await this.activeCallChannel?.send({
      type: "broadcast",
      event: "call_accepted",
      payload: this.activeCall,
    });
  }

  async declineCall(signal: CallSignal): Promise<void> {
    const channel = supabase.channel(`call:${signal.callId}`);
    await channel.subscribe();
    try {
      await channel.send({
        type: "broadcast",
        event: "call_declined",
        payload: { ...signal, status: "declined" as CallStatus },
      });
    } finally {
      await supabase.removeChannel(channel);
    }
  }

  /** Hang up / cancel. Notifies the peer, then tears the call channel down. */
  async endCall(reason: "ended" | "missed" = "ended"): Promise<void> {
    this.clearRingTimeout();
    const call = this.activeCall;
    if (!call) return;

    const payload: CallSignal = {
      ...call,
      status: reason === "missed" ? "missed" : "ended",
    };

    try {
      if (reason === "missed" && call.status === "ringing") {
        // Never picked up — clear the ringing UI on the receiver's inbox.
        const receiverChannel = supabase.channel(`calls:${call.receiverId}`);
        await receiverChannel.subscribe();
        await receiverChannel.send({
          type: "broadcast",
          event: "call_cancelled",
          payload,
        });
        await supabase.removeChannel(receiverChannel);
      } else {
        await this.activeCallChannel?.send({
          type: "broadcast",
          event: "call_ended",
          payload,
        });
      }
    } catch (err) {
      console.error("[callSignaling] failed to signal end", err);
    }

    if (this.activeCallChannel) {
      await supabase.removeChannel(this.activeCallChannel);
      this.activeCallChannel = null;
    }
    this.activeCall = null;
  }

  getActiveCall(): CallSignal | null {
    return this.activeCall;
  }

  /**
   * Listen to one call's channel without touching the global inbox
   * subscription. The in-call screen uses this: calling `initialize` there
   * would replace the app-wide ringer's callbacks and silently stop incoming
   * calls from being announced once the first call ended.
   *
   * Returns an unsubscribe function.
   */
  observeCall(
    callId: string,
    handlers: {
      onAccepted?: (signal: CallSignal) => void;
      onDeclined?: (signal: CallSignal) => void;
      onEnded?: (signal: CallSignal) => void;
    }
  ): () => void {
    const channel = supabase
      .channel(`call-observer:${callId}`)
      .on("broadcast", { event: "call_accepted" }, ({ payload }) =>
        handlers.onAccepted?.(payload as CallSignal)
      )
      .on("broadcast", { event: "call_declined" }, ({ payload }) =>
        handlers.onDeclined?.(payload as CallSignal)
      )
      .on("broadcast", { event: "call_ended" }, ({ payload }) =>
        handlers.onEnded?.(payload as CallSignal)
      );

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }

  async shutdown(): Promise<void> {
    this.clearRingTimeout();
    await this.endCall();
    await this.teardownUserChannel();
    this.currentUserId = null;
    this.callbacks = {};
  }
}

export const callSignaling = new CallSignalingService();
