"use client";

/**
 * Live room — one route serves both sides.
 * `?host=1` publishes camera + mic; everyone else joins as a subscribe-only
 * viewer, matching the mobile LiveStreamingScreen / LiveViewerScreen split.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Mic,
  MicOff,
  Radio,
  SwitchCamera,
  Users,
  Video as VideoIcon,
  VideoOff,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { Spinner, EmptyState, PrimaryButton } from "@/components/ui";
import { AudioTrackView, VideoTrackView } from "@/components/live/TrackView";
import { useCurrentUserId } from "@/lib/query/hooks";
import { useLiveKitRoom } from "@/lib/live/useLiveKitRoom";
import { endStream } from "@/lib/api/live";
import { cn, formatDuration } from "@/lib/utils";

export default function LiveRoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const isHost = searchParams.get("host") === "1";

  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(Date.now());
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
    roomName: roomId,
    participantName: currentUserId,
    role: isHost ? "host" : "viewer",
    publishAudio: isHost,
    publishVideo: isHost,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Viewers watch the host; hosts watch their own preview.
  const hostTrack = participants.find((p) => p.videoTrack)?.videoTrack;
  const viewerCount = isHost
    ? participants.length
    : Math.max(0, participants.length - 1);

  const leave = useCallback(
    async (endBroadcast: boolean) => {
      if (endedRef.current) return;
      endedRef.current = true;

      await disconnect();
      if (endBroadcast) {
        try {
          await endStream(roomId);
        } catch (err) {
          console.error("[live] end stream failed", err);
        }
        router.replace(
          `/live/${roomId}/summary?duration=${elapsed}&viewers=${viewerCount}`
        );
        return;
      }
      router.push("/feed");
    },
    [disconnect, roomId, router, elapsed, viewerCount]
  );

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black px-6">
        <EmptyState
          icon={<Radio className="h-7 w-7" />}
          title="Couldn't join this stream"
          message={error}
          action={
            <PrimaryButton onClick={() => router.push("/feed")}>
              Back to feed
            </PrimaryButton>
          }
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Every remote participant's audio needs an element to play through. */}
      {participants.map((p) => (
        <AudioTrackView key={p.identity} track={p.audioTrack} />
      ))}

      <div className="relative flex-1 overflow-hidden">
        {isHost ? (
          localVideoTrack ? (
            <VideoTrackView track={localVideoTrack} mirror className="absolute inset-0" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {connecting ? <Spinner /> : <VideoOff className="h-10 w-10 text-white/40" />}
            </div>
          )
        ) : hostTrack ? (
          <VideoTrackView track={hostTrack} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Spinner />
            <p className="text-sm text-white/60">
              {connecting ? "Joining stream…" : "Waiting for the host…"}
            </p>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pb-10 pt-5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white",
                connected ? "bg-[var(--error)]" : "bg-white/25"
              )}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white">
              {formatDuration(elapsed)}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white">
              <Users className="h-3 w-3" />
              <span className="tabular-nums">{viewerCount}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => leave(isHost)}
            aria-label={isHost ? "End stream" : "Leave stream"}
            className="rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Host controls */}
      {isHost && (
        <div className="flex shrink-0 items-center justify-center gap-4 bg-black/40 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 backdrop-blur-md">
          <ControlButton
            label={micEnabled ? "Mute" : "Unmute"}
            active={!micEnabled}
            onClick={toggleMic}
            icon={micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          />
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
          <button
            type="button"
            onClick={() => leave(true)}
            className="rounded-full bg-[var(--error)] px-6 py-4 text-sm font-bold text-white shadow-lg transition active:scale-95"
          >
            End Stream
          </button>
        </div>
      )}

      {!isHost && (
        <div className="flex shrink-0 items-center justify-center bg-black/40 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => leave(false)}
            className="rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/25"
          >
            Leave stream
          </button>
        </div>
      )}
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
