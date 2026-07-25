"use client";

/** Record a duet/remix of an existing voice clip. */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Mic, Square, Trash2, Globe } from "lucide-react";
import toast from "react-hot-toast";

import {
  AppHeader,
  EmptyState,
  GlassCard,
  PrimaryButton,
  Skeleton,
  WaveformPlayer,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId, useLanguages } from "@/lib/query/hooks";
import { supabase } from "@/lib/supabase/client";
import { uploadAudio } from "@/lib/storage";
import { analytics } from "@/components/providers/PostHogProvider";
import { useMediaRecorder } from "../../record/useMediaRecorder";
import { createRemix, DUET_OPTIONS, type DuetType } from "@/lib/api/duets";
import { cn, formatDuration } from "@/lib/utils";
import type { VoiceClipRow } from "@/lib/types";

const MAX_DURATION_SEC = 120;
const MIN_DURATION_SEC = 3;

async function fetchParentClip(clipId: string) {
  const { data, error } = await supabase
    .from("voice_clips")
    .select("id, phrase, translation, language, dialect, audio_url, duration, user_id")
    .eq("id", clipId)
    .maybeSingle();
  if (error) throw error;
  return (data as Partial<VoiceClipRow> & { id: string }) ?? null;
}

export default function DuetRecordPage() {
  const params = useParams<{ clipId: string }>();
  const clipId = params.clipId;
  const router = useRouter();
  const userId = useCurrentUserId();
  const recorder = useMediaRecorder();
  const { data: languages } = useLanguages();

  const [duetType, setDuetType] = useState<DuetType | null>(null);
  const [languageId, setLanguageId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const { data: parent, isLoading, isError } = useQuery({
    queryKey: ["duet-parent", clipId],
    enabled: !!clipId,
    queryFn: () => fetchParentClip(clipId),
  });

  const selectedLanguage =
    languages?.find((l) => l.id === languageId) ??
    languages?.find((l) => l.name === parent?.language) ??
    languages?.[0];

  const hasRecorded = recorder.status === "stopped" && !!recorder.blob;

  useEffect(() => {
    if (recorder.status === "recording" && recorder.duration >= MAX_DURATION_SEC) {
      recorder.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, recorder.duration]);

  useEffect(() => {
    if (!recorder.blob) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(recorder.blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [recorder.blob]);

  useEffect(() => {
    if (recorder.error) toast.error(recorder.error);
  }, [recorder.error]);

  const handlePublish = async () => {
    if (!userId) {
      toast.error("Sign in to publish a duet.");
      return;
    }
    if (!recorder.blob || !parent || !duetType) return;
    if (recorder.duration < MIN_DURATION_SEC) {
      toast.error(`Recordings must be at least ${MIN_DURATION_SEC}s.`);
      return;
    }

    setPublishing(true);
    try {
      const { publicUrl } = await uploadAudio(userId, recorder.blob);
      // The backend creates the child clip and links it to the parent.
      await createRemix({
        parentClipId: parent.id,
        parentClipPhrase: parent.phrase ?? "",
        language: selectedLanguage?.name ?? parent.language ?? "English",
        dialect: selectedLanguage?.dialect ?? null,
        audioUrl: publicUrl,
        duetType,
      });

      analytics.track("duet_published", { duet_type: duetType });
      toast.success("Duet published!");
      router.push("/library");
    } catch (err) {
      console.error("[duet] publish failed", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to publish. Please try again."
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-full">
      <AppHeader title="Create Duet" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-[16px]" />
        ) : isError || !parent ? (
          <EmptyState
            title="Clip not found"
            message="The original clip may have been removed."
            action={
              <PrimaryButton onClick={() => router.push("/feed")}>
                Back to feed
              </PrimaryButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-5">
            {/* Original clip */}
            <GlassCard className="p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Original clip
              </p>
              {parent.phrase && (
                <p className="mb-1 text-[17px] font-semibold text-[var(--foreground)]">
                  {parent.phrase}
                </p>
              )}
              {parent.translation && (
                <p className="mb-3 text-sm italic text-[var(--muted)]">
                  {parent.translation}
                </p>
              )}
              <WaveformPlayer
                src={parent.audio_url}
                duration={parent.duration ?? undefined}
                seed={parent.id}
              />
            </GlassCard>

            {/* Duet type */}
            <div>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Duet type
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {DUET_OPTIONS.map((option) => {
                  const selected = duetType === option.type;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => setDuetType(option.type)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-[16px] border p-4 text-left transition",
                        selected
                          ? "border-transparent"
                          : "border-[var(--border-light)] hover:border-[var(--muted)]"
                      )}
                      style={
                        selected
                          ? {
                              backgroundColor: `${option.color}1A`,
                              borderColor: option.color,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="block text-sm font-bold"
                        style={{ color: selected ? option.color : undefined }}
                      >
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--muted)]">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language */}
            <GlassCard className="flex items-center gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20">
                <Globe className="h-4 w-4 text-[var(--color-primary)]" />
              </span>
              <label className="flex-1">
                <span className="sr-only">Language</span>
                <select
                  value={selectedLanguage?.id ?? ""}
                  onChange={(e) => setLanguageId(e.target.value)}
                  disabled={recorder.status === "recording"}
                  className="w-full cursor-pointer appearance-none bg-transparent bg-[right_center] bg-no-repeat pr-6 text-[15px] font-medium text-[var(--foreground)] outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    // `appearance-none` removes the native arrow — put one back.
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
                    backgroundSize: "16px 16px",
                  }}
                >
                  {(languages ?? []).map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.dialect ? `${lang.name} (${lang.dialect})` : lang.name}
                    </option>
                  ))}
                </select>
              </label>
            </GlassCard>

            {/* Recorder */}
            <GlassCard className="flex flex-col items-center gap-4 p-6">
              {hasRecorded ? (
                <>
                  <WaveformPlayer
                    src={objectUrl}
                    duration={Math.round(recorder.duration)}
                    seed={clipId}
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={recorder.reset}
                    className="flex items-center gap-1.5 text-sm font-medium text-[var(--error)]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Record again
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm tabular-nums text-[var(--muted)]">
                    {recorder.status === "recording"
                      ? formatDuration(Math.round(recorder.duration))
                      : duetType
                      ? "Tap to record your duet"
                      : "Pick a duet type first"}
                  </p>
                  <button
                    type="button"
                    disabled={!duetType}
                    onClick={() =>
                      recorder.status === "recording"
                        ? recorder.stop()
                        : recorder.start()
                    }
                    aria-label={
                      recorder.status === "recording" ? "Stop recording" : "Start recording"
                    }
                    className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-full text-white transition active:scale-95 disabled:opacity-40",
                      recorder.status === "recording"
                        ? "bg-[var(--error)]"
                        : "bg-brand-gradient shadow-glow"
                    )}
                  >
                    {recorder.status === "recording" ? (
                      <Square className="h-7 w-7" fill="currentColor" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </button>
                </>
              )}
            </GlassCard>

            <PrimaryButton
              size="lg"
              loading={publishing}
              disabled={!hasRecorded || !duetType || publishing}
              onClick={handlePublish}
            >
              Publish Duet
            </PrimaryButton>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
