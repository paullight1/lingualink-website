"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Send, Square, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { UserAvatar, Spinner, Textarea } from "@/components/ui";
import { useCurrentUserId, useMyProfile } from "@/lib/query/hooks";
import { uploadAudio } from "@/lib/storage";
import { pickAudioMimeType } from "@/lib/media";
import { cn, formatDuration } from "@/lib/utils";
import { createComment, type Comment } from "@/lib/api/comments";

/**
 * Composer for a comment or reply. Supports a text body, a recorded voice note,
 * or both — the mobile CommentItem already renders `audio_url`, so voice notes
 * left here play back in the Expo app.
 */
export interface CommentInputProps {
  clipId: string;
  replyingTo?: Comment | null;
  onCancelReply?: () => void;
  onCommentAdded?: (comment: Comment) => void;
  placeholder?: string;
}

const MAX_VOICE_SEC = 60;

export function CommentInput({
  clipId,
  replyingTo,
  onCancelReply,
  onCommentAdded,
  placeholder = "Add a comment…",
}: CommentInputProps) {
  const userId = useCurrentUserId();
  const { data: profile } = useMyProfile();

  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => stopTimer, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickAudioMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        setVoiceBlob(
          new Blob(chunksRef.current, {
            type: recorder.mimeType || mimeType || "audio/mp4",
          })
        );
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setElapsed(0);
      const startedAt = Date.now();
      timerRef.current = setInterval(() => {
        const secs = (Date.now() - startedAt) / 1000;
        setElapsed(secs);
        if (secs >= MAX_VOICE_SEC) stopRecording();
      }, 200);
    } catch {
      toast.error("Microphone access was denied.");
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    stopTimer();
    setIsRecording(false);
  };

  const discardVoice = () => {
    setVoiceBlob(null);
    setElapsed(0);
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Sign in to comment");
      return;
    }
    const text = content.trim();
    if (!text && !voiceBlob) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      let audioUrl: string | null = null;
      let audioDuration: number | null = null;
      if (voiceBlob) {
        const upload = await uploadAudio(userId, voiceBlob);
        audioUrl = upload.publicUrl;
        audioDuration = Math.round(elapsed);
      }

      const comment = await createComment({
        clipId,
        userId,
        content: text,
        parentCommentId: replyingTo?.id ?? null,
        audioUrl,
        audioDuration,
      });

      setContent("");
      discardVoice();
      onCancelReply?.();
      onCommentAdded?.(comment);
    } catch (err) {
      console.error("[CommentInput] submit failed", err);
      toast.error("Couldn't post your comment");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = (!!content.trim() || !!voiceBlob) && !submitting;

  return (
    <div className="border-t border-[var(--border-light)] bg-[var(--surface)] px-4 py-3">
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between rounded-full bg-[var(--input)] px-3 py-1.5">
          <span className="truncate text-xs text-[var(--muted)]">
            Replying to{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {replyingTo.user.full_name || replyingTo.user.username}
            </span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="ml-2 shrink-0 rounded-full p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {voiceBlob && !isRecording && (
        <div className="mb-2 flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3 py-2">
          <Mic className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
          <span className="flex-1 text-xs font-medium text-[var(--color-primary)]">
            Voice note · {formatDuration(Math.round(elapsed))}
          </span>
          <button
            type="button"
            onClick={discardVoice}
            aria-label="Discard voice note"
            className="rounded-full p-1 text-[var(--muted)] hover:text-[var(--error)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <UserAvatar
          uri={profile?.avatar_url}
          name={profile?.full_name || "You"}
          size={32}
        />

        {isRecording ? (
          <div className="flex flex-1 items-center gap-2 rounded-full bg-[var(--error)]/10 px-4 py-2.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--error)]" />
            <span className="flex-1 text-sm font-medium tabular-nums text-[var(--error)]">
              Recording {formatDuration(Math.round(elapsed))}
            </span>
            <button
              type="button"
              onClick={stopRecording}
              aria-label="Stop recording"
              className="rounded-full p-1 text-[var(--error)]"
            >
              <Square className="h-4 w-4" fill="currentColor" />
            </button>
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={1}
            autoResize
            maxHeight={112}
            aria-label={replyingTo ? "Write a reply" : placeholder}
            placeholder={replyingTo ? "Write a reply…" : placeholder}
            wrapperClassName="min-h-[42px] flex-1 rounded-[20px] py-2.5"
            className="text-[14px]"
          />
        )}

        {!isRecording && !voiceBlob && !content.trim() && (
          <button
            type="button"
            onClick={startRecording}
            aria-label="Record a voice comment"
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[var(--input)] text-[var(--muted)] transition hover:text-[var(--color-primary)]"
          >
            <Mic className="h-[18px] w-[18px]" />
          </button>
        )}

        {(content.trim() || voiceBlob) && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Post comment"
            className={cn(
              "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-white transition",
              canSubmit ? "bg-brand-gradient shadow-glow" : "bg-[var(--muted)] opacity-50"
            )}
          >
            {submitting ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Send className="h-[18px] w-[18px]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
