"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, PhoneOff, Video as VideoIcon } from "lucide-react";
import { UserAvatar } from "@/components/ui";
import { useCurrentUserId } from "@/lib/query/hooks";
import {
  callSignaling,
  type CallSignal,
} from "@/lib/api/callSignaling";
import { logCallEnd } from "@/lib/api/live";

/**
 * App-wide incoming call handling. Subscribes to the user's `calls:{userId}`
 * broadcast inbox — the same channel the mobile app rings — and shows a
 * full-screen accept/decline sheet from any page.
 *
 * Mounted once in the authenticated layout.
 */
export function IncomingCallListener() {
  const currentUserId = useCurrentUserId();
  const router = useRouter();
  const [incoming, setIncoming] = useState<CallSignal | null>(null);

  useEffect(() => {
    if (!currentUserId) return;

    callSignaling.initialize(currentUserId, {
      onIncomingCall: (signal) => setIncoming(signal),
      // Caller gave up or the ring timed out.
      onCallCancelled: () => setIncoming(null),
      onCallEnded: () => setIncoming(null),
    });

    return () => {
      callSignaling.shutdown();
    };
  }, [currentUserId]);

  const accept = useCallback(async () => {
    if (!incoming) return;
    const signal = incoming;
    setIncoming(null);
    await callSignaling.acceptCall(signal);
    router.push(
      `/call/${signal.callId}?type=${signal.callType}&peer=${signal.callerId}&role=callee`
    );
  }, [incoming, router]);

  const decline = useCallback(async () => {
    if (!incoming) return;
    const signal = incoming;
    setIncoming(null);
    await callSignaling.declineCall(signal);
    await logCallEnd(signal.callId, "declined");
  }, [incoming]);

  if (!incoming) return null;

  const isVideo = incoming.callType === "video";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-[#0b0b0d]/95 px-6 py-16 backdrop-blur-md">
      <div className="flex flex-col items-center gap-5 pt-10">
        <UserAvatar
          uri={incoming.callerAvatar}
          name={incoming.callerName}
          size={128}
          ring
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{incoming.callerName}</h2>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/70">
            {isVideo ? (
              <VideoIcon className="h-4 w-4" />
            ) : (
              <Phone className="h-4 w-4" />
            )}
            Incoming {isVideo ? "video" : "voice"} call
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-xs items-center justify-between">
        <button
          type="button"
          onClick={decline}
          aria-label="Decline call"
          className="flex flex-col items-center gap-2"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error)] text-white shadow-lg transition active:scale-95">
            <PhoneOff className="h-6 w-6" />
          </span>
          <span className="text-xs font-medium text-white/70">Decline</span>
        </button>

        <button
          type="button"
          onClick={accept}
          aria-label="Accept call"
          className="flex flex-col items-center gap-2"
        >
          <span className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-[var(--success)] text-white shadow-lg transition active:scale-95">
            <Phone className="h-6 w-6" />
          </span>
          <span className="text-xs font-medium text-white/70">Accept</span>
        </button>
      </div>
    </div>
  );
}
