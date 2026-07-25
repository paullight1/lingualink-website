"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Send, Square, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Spinner, Textarea } from "@/components/ui";
import { pickAudioMimeType } from "@/lib/media";
import { cn, formatDuration } from "@/lib/utils";

/**
 * Message composer: text, or a recorded voice note.
 * Voice notes are uploaded as `audio/mp4` where the browser supports it, so
 * they play back in the mobile app's chat too.
 */
export interface MessageComposerProps {
  onSendText: (text: string) => Promise<void>;
  onSendVoice: (blob: Blob) => Promise<void>;
  disabled?: boolean;
}

const MAX_VOICE_SEC = 120;

export function MessageComposer({
  onSendText,
  onSendVoice,
  disabled = false,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => stopTimer, []);

  const handleSendText = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    // Clear optimistically so typing can continue immediately.
    setText("");
    try {
      await onSendText(body);
    } catch {
      setText(body);
      toast.error("Couldn't send message");
    } finally {
      setSending(false);
    }
  };

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
      cancelledRef.current = false;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (cancelledRef.current) return;

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/mp4",
        });
        setSending(true);
        try {
          await onSendVoice(blob);
        } catch {
          toast.error("Couldn't send voice message");
        } finally {
          setSending(false);
        }
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

  const cancelRecording = () => {
    cancelledRef.current = true;
    stopRecording();
    setElapsed(0);
  };

  return (
    <div className="sticky bottom-0 border-t border-[var(--border-light)] bg-[var(--surface)] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-2">
        {isRecording ? (
          <>
            <button
              type="button"
              onClick={cancelRecording}
              aria-label="Cancel recording"
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--input)] text-[var(--muted)] hover:text-[var(--error)]"
            >
              <Trash2 className="h-[18px] w-[18px]" />
            </button>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-[var(--error)]/10 px-4 py-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--error)]" />
              <span className="flex-1 text-sm font-medium tabular-nums text-[var(--error)]">
                {formatDuration(Math.round(elapsed))}
              </span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              aria-label="Send voice message"
              className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow"
            >
              <Square className="h-4 w-4" fill="currentColor" />
            </button>
          </>
        ) : (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              rows={1}
              autoResize
              maxHeight={128}
              disabled={disabled}
              aria-label="Message"
              placeholder="Message…"
              wrapperClassName="min-h-[44px] flex-1 rounded-[22px]"
            />

            {text.trim() ? (
              <button
                type="button"
                onClick={handleSendText}
                disabled={sending || disabled}
                aria-label="Send message"
                className={cn(
                  "flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-white transition",
                  sending || disabled
                    ? "bg-[var(--muted)] opacity-50"
                    : "bg-brand-gradient shadow-glow"
                )}
              >
                {sending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Send className="h-[18px] w-[18px]" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                disabled={sending || disabled}
                aria-label="Record a voice message"
                className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--input)] text-[var(--muted)] transition hover:text-[var(--color-primary)] disabled:opacity-50"
              >
                {sending ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <Mic className="h-[18px] w-[18px]" />
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
