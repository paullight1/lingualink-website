"use client";

/** Active 1:1 call (voice or video) over LiveKit. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Mic,
  MicOff,
  Phone,
  Video as VideoIcon,
  VideoOff,
  SwitchCamera,
} from "lucide-react";

import { Spinner, UserAvatar } from "@/components/ui";
import { AudioTrackView, VideoTrackView } from "@/components/live/TrackView";
import { useCurrentUserId, useProfile } from "@/lib/query/hooks";
import { useLiveKitRoom } from "@/lib/live/useLiveKitRoom";
import { callSignaling } from "@/lib/api/callSignaling";
import { logCallAnswered, logCallEnd } from "@/lib/api/live";
import { cn, formatDuration } from "@/lib/utils";

export default function CallPage() {
  const params = useParams<{ callId: string }>();
  const callId = params.callId;
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const callType = searchParams.get("type") === "video" ? "video" : "voice";
  const peerId = searchParams.get("peer");
  const isCaller = searchParams.get("role") !== "callee";

  const { data: peer } = useProfile(peerId ?? undefined);
  const peerName = peer?.full_name || peer?.username || "Unknown";

  const [seconds, setSeconds] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  const {
    connected,
    connecting,
    error,
    participants,
    localVideoTrack,
    micEnabled,
    cameraEnabled,
    disconnect,
    toggleMic,
    toggleCamera,
    switchCamera,
  } = useLiveKitRoom({
    roomName: callId,
    participantName: currentUserId,
    publishAudio: true,
    publishVideo: callType === "video",
  });

  // The remote side is present once anyone else joins the room.
  const remote = participants[0];
  const isPeerConnected = !!remote;

  // Duration starts when the other side actually joins, not on dial.
  useEffect(() => {
    if (!isPeerConnected || startedAtRef.current) return;
    startedAtRef.current = Date.now();
    logCallAnswered(callId);
    const timer = setInterval(() => {
      if (startedAtRef.current) {
        setSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPeerConnected, callId]);

  const endCall = useCallback(
    async (reason: string) => {
      if (endedRef.current) return;
      endedRef.current = true;

      await Promise.allSettled([
        disconnect(),
        callSignaling.endCall(),
        logCallEnd(callId, reason),
      ]);
      router.push("/chat");
    },
    [callId, disconnect, router]
  );

  // If the peer hangs up or declines, leave too. This observes the call's own
  // channel rather than re-initializing the signaling service, so the app-wide
  // incoming-call ringer keeps its callbacks.
  useEffect(() => {
    if (!callId) return;
    return callSignaling.observeCall(callId, {
      onEnded: () => endCall("peer_ended"),
      onDeclined: () => endCall("declined"),
    });
  }, [callId, endCall]);

  const statusLine = useMemo(() => {
    if (error) return error;
    if (connecting) return "Connecting…";
    if (!isPeerConnected) return isCaller ? "Ringing…" : "Joining…";
    return formatDuration(seconds);
  }, [error, connecting, isPeerConnected, isCaller, seconds]);

  const showVideo = callType === "video";
  const remoteVideo = remote?.videoTrack;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0b0d]">
      {/* Remote audio always plays, video only for video calls */}
      <AudioTrackView track={remote?.audioTrack} />

      <div className="relative flex-1 overflow-hidden">
        {showVideo && remoteVideo ? (
          <VideoTrackView track={remoteVideo} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            <UserAvatar
              uri={peer?.avatar_url}
              name={peerName}
              size={128}
              ring={isPeerConnected}
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">{peerName}</h1>
              <p className="mt-1 text-sm tabular-nums text-white/60">
                {statusLine}
              </p>
            </div>
            {connecting && <Spinner />}
          </div>
        )}

        {/* Header overlay for video calls */}
        {showVideo && remoteVideo && (
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-5 pb-10 pt-6">
            <h1 className="text-lg font-bold text-white">{peerName}</h1>
            <p className="text-sm tabular-nums text-white/70">{statusLine}</p>
          </div>
        )}

        {/* Local self-view */}
        {showVideo && localVideoTrack && (
          <div className="absolute bottom-4 right-4 h-40 w-28 overflow-hidden rounded-[16px] border border-white/20 bg-black shadow-lg">
            <VideoTrackView track={localVideoTrack} mirror />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex shrink-0 items-center justify-center gap-4 bg-black/40 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 backdrop-blur-md">
        <ControlButton
          label={micEnabled ? "Mute" : "Unmute"}
          active={!micEnabled}
          onClick={toggleMic}
          icon={micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        />

        {showVideo && (
          <>
            <ControlButton
              label={cameraEnabled ? "Turn camera off" : "Turn camera on"}
              active={!cameraEnabled}
              onClick={toggleCamera}
              icon={
                cameraEnabled ? (
                  <VideoIcon className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )
              }
            />
            <ControlButton
              label="Switch camera"
              onClick={switchCamera}
              icon={<SwitchCamera className="h-5 w-5" />}
            />
          </>
        )}

        <button
          type="button"
          onClick={() => endCall(isCaller ? "caller_ended" : "receiver_ended")}
          aria-label="End call"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error)] text-white shadow-lg transition active:scale-95"
        >
          <Phone className="h-6 w-6 rotate-[135deg]" />
        </button>
      </div>

      {/* `connected` is surfaced for screen readers without cluttering the UI. */}
      <span className="sr-only" role="status">
        {connected ? "Call connected" : statusLine}
      </span>
    </div>
  );
}

function ControlButton({
  label,
  icon,
  onClick,
  active = false,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full transition active:scale-95",
        active ? "bg-white text-black" : "bg-white/15 text-white hover:bg-white/25"
      )}
    >
      {icon}
    </button>
  );
}
