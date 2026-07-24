"use client";

import { useCallback, useRef, useState } from "react";
import { pickAudioMimeType } from "@/lib/media";

export type RecorderStatus = "idle" | "recording" | "paused" | "stopped";

export interface UseMediaRecorderResult {
  status: RecorderStatus;
  duration: number; // seconds, updates every ~200ms while recording
  level: number; // 0..1 live input amplitude, for pulse/level UI
  blob: Blob | null;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

/**
 * Thin wrapper around the browser MediaRecorder API for audio capture.
 * Mirrors the mobile app's expo-av recording flow (start/stop, duration,
 * playback blob) but for the web. Also exposes a live amplitude "level"
 * (via Web Audio's AnalyserNode) so the UI can drive a mic pulse animation.
 */
export function useMediaRecorder(): UseMediaRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef(0);
  const pausedElapsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanupAudioGraph = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    analyserRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const tickLevel = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    setLevel(Math.min(1, rms * 4));
    rafRef.current = requestAnimationFrame(tickLevel);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setBlob(null);
    chunksRef.current = [];
    setDuration(0);
    pausedElapsedRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextCtor) {
        const ctx = new AudioContextCtor();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        rafRef.current = requestAnimationFrame(tickLevel);
      }

      // Prefer MP4/AAC so the clip is playable by the mobile app reading the
      // same table; falls through to the browser default when unsupported.
      const mimeType = pickAudioMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        setBlob(new Blob(chunksRef.current, { type }));
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        cleanupAudioGraph();
      };

      recorder.start();
      startedAtRef.current = Date.now();
      setStatus("recording");

      stopTimer();
      timerRef.current = setInterval(() => {
        setDuration(
          pausedElapsedRef.current +
            (Date.now() - startedAtRef.current) / 1000
        );
      }, 200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
            ? "Microphone access was denied. Enable it in your browser settings."
            : err.message
          : "Could not access the microphone.";
      setError(message);
      setStatus("idle");
    }
  }, [cleanupAudioGraph, stopTimer, tickLevel]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    stopTimer();
    setLevel(0);
    setStatus("stopped");
  }, [stopTimer]);

  const pause = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "recording") return;
    recorder.pause();
    pausedElapsedRef.current += (Date.now() - startedAtRef.current) / 1000;
    stopTimer();
    setStatus("paused");
  }, [stopTimer]);

  const resume = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state !== "paused") return;
    recorder.resume();
    startedAtRef.current = Date.now();
    setStatus("recording");
    stopTimer();
    timerRef.current = setInterval(() => {
      setDuration(
        pausedElapsedRef.current + (Date.now() - startedAtRef.current) / 1000
      );
    }, 200);
  }, [stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    cleanupAudioGraph();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    pausedElapsedRef.current = 0;
    setDuration(0);
    setLevel(0);
    setBlob(null);
    setError(null);
    setStatus("idle");
  }, [cleanupAudioGraph, stopTimer]);

  return { status, duration, level, blob, error, start, stop, pause, resume, reset };
}
