"use client";

/** Video recorder: getUserMedia live preview → MediaRecorder capture → thumbnail + publish to `video_clips`. */

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Camera,
  Check,
  RotateCcw,
  SwitchCamera,
  VideoOff,
  Loader2,
} from "lucide-react";
import { GlassCard, PrimaryButton, EmptyState } from "@/components/ui";
import { uploadVideo } from "@/lib/storage";
import { supabase } from "@/lib/supabase/client";
import { useCurrentUserId } from "@/lib/query/hooks";
import { cn, formatDuration } from "@/lib/utils";
import { pickVideoMimeType } from "@/lib/media";

type PermissionState = "idle" | "requesting" | "granted" | "denied";
type FacingMode = "user" | "environment";

// Container choice lives in lib/media.ts — it prefers H.264/AAC MP4 so clips
// recorded here are playable by the mobile app reading the same `video_clips`.
const pickMimeType = pickVideoMimeType;

/** Draw a mid-point frame of the recorded blob onto a canvas to use as a poster image. */
async function generateThumbnail(blob: Blob): Promise<Blob | null> {
  try {
    const url = URL.createObjectURL(blob);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Failed to load video for thumbnail"));
    });
    video.currentTime = Math.min(0.3, (video.duration || 1) / 2);
    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("Failed to seek video for thumbnail"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    return await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82)
    );
  } catch {
    return null;
  }
}

export function VideoRecorder({
  language,
  prompt,
  onPublished,
}: {
  language?: string;
  prompt?: string;
  onPublished?: () => void;
}) {
  const userId = useCurrentUserId();

  const [permission, setPermission] = useState<PermissionState>("idle");
  const [facing, setFacing] = useState<FacingMode>("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState(prompt ?? "");
  const [isPublishing, setIsPublishing] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const requestCamera = useCallback(async (mode: FacingMode) => {
    setPermission("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: true,
      });
      stopStream();
      streamRef.current = stream;
      if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
      setFacing(mode);
      setPermission("granted");

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(
          devices.filter((d) => d.kind === "videoinput").length > 1
        );
      } catch {
        setHasMultipleCameras(false);
      }
    } catch (err) {
      console.error("[VideoRecorder] getUserMedia failed", err);
      setPermission("denied");
    }
  }, [stopStream]);

  // Request camera+mic on mount.
  useEffect(() => {
    requestCamera("user");
    return () => {
      stopTimer();
      stopStream();
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFlipCamera = () => {
    if (isRecording) return;
    requestCamera(facing === "user" ? "environment" : "user");
  };

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream || isRecording) return;

    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || mimeType || "video/mp4",
      });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
    };

    recorder.start();
    recorderRef.current = recorder;
    setIsRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    recorderRef.current?.stop();
    setIsRecording(false);
    stopTimer();
  };

  const handleRetake = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setCaption(prompt ?? "");
  };

  const handlePublish = async () => {
    if (!userId || !recordedBlob) return;
    setIsPublishing(true);
    try {
      const videoUpload = await uploadVideo(userId, recordedBlob);

      let thumbnailUrl: string | null = null;
      const thumbBlob = await generateThumbnail(recordedBlob);
      if (thumbBlob) {
        try {
          const thumbUpload = await uploadVideo(userId, thumbBlob, "jpg");
          thumbnailUrl = thumbUpload.publicUrl;
        } catch (thumbErr) {
          console.error("[VideoRecorder] thumbnail upload failed", thumbErr);
        }
      }

      const { error } = await supabase.from("video_clips").insert({
        user_id: userId,
        phrase: caption.trim() || null,
        language: language ?? null,
        video_url: videoUpload.publicUrl,
        thumbnail_url: thumbnailUrl,
        duration,
      });
      if (error) throw error;

      toast.success("Video published!");
      onPublished?.();
      handleRetake();
    } catch (err) {
      console.error("[VideoRecorder] publish failed", err);
      toast.error("Failed to publish video. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Permission states ──────────────────────────────────────────────────
  if (permission === "denied") {
    return (
      <EmptyState
        icon={<VideoOff className="h-7 w-7" />}
        title="Camera access needed"
        message="Allow camera and microphone access in your browser to record a video clip."
        action={
          <PrimaryButton fullWidth={false} onClick={() => requestCamera("user")}>
            Try again
          </PrimaryButton>
        }
      />
    );
  }

  if (permission === "idle" || permission === "requesting") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-[var(--muted)]">Requesting camera access…</p>
      </div>
    );
  }

  // ── Preview / publish stage ─────────────────────────────────────────────
  if (recordedUrl) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[24px] bg-black">
          <video
            src={recordedUrl}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        </div>

        <GlassCard className="p-4">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
            Description
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What are you saying in this video?"
            rows={3}
            className="w-full resize-none bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
          />
        </GlassCard>

        <div className="flex gap-3">
          <PrimaryButton
            variant="secondary"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleRetake}
            disabled={isPublishing}
          >
            Retake
          </PrimaryButton>
          <PrimaryButton
            leftIcon={!isPublishing ? <Check className="h-4 w-4" /> : undefined}
            loading={isPublishing}
            onClick={handlePublish}
          >
            Publish
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // ── Live camera / recording stage ───────────────────────────────────────
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[24px] bg-black">
        <video
          ref={liveVideoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />

        {prompt && (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 top-[38%] flex justify-center px-8 transition-opacity duration-700",
              isRecording ? "opacity-0" : "opacity-100"
            )}
          >
            <p className="text-center text-xl font-bold leading-snug text-white drop-shadow-lg">
              {prompt}
            </p>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--error)]/90 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="text-sm font-bold text-white">
              {formatDuration(duration)}
            </span>
          </div>
        )}

        {!isRecording && hasMultipleCameras && (
          <button
            type="button"
            onClick={handleFlipCamera}
            className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            aria-label="Switch camera"
          >
            <SwitchCamera className="h-5 w-5" />
          </button>
        )}

        {!isRecording && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white">
            <Camera className="h-3.5 w-3.5" />
            {facing === "user" ? "Front camera" : "Back camera"}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-[var(--foreground)]/80"
        >
          {isRecording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--error)]/40" />
          )}
          <span
            className={cn(
              "bg-[var(--error)] transition-all",
              isRecording ? "h-7 w-7 rounded-md" : "h-14 w-14 rounded-full"
            )}
          />
        </button>
        {!isRecording && (
          <p className="text-xs font-medium text-[var(--muted)]">
            Tap to start recording
          </p>
        )}
      </div>
    </div>
  );
}
