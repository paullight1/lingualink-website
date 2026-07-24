"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Mic, Square, Shuffle, Wand2, Globe, Trash2 } from "lucide-react";
import { GlassCard, PrimaryButton, WaveformPlayer } from "@/components/ui";
import { cn, formatDuration } from "@/lib/utils";
import { useCurrentUserId, useLanguages, type LanguageOption } from "@/lib/query/hooks";
import { supabase } from "@/lib/supabase/client";
import { uploadAudio } from "@/lib/storage";
import { analytics } from "@/components/providers/PostHogProvider";
import { useMediaRecorder } from "./useMediaRecorder";
import { generateDailyPrompts, markPromptAsUsed } from "./dailyPrompts";

const MAX_DURATION_SEC = 120;

/** Mobile refuses to publish anything shorter — below this a clip isn't monetizable. */
const MIN_DURATION_SEC = 3;

/** Shown while the shared `languages` table is loading or if it comes back empty. */
const FALLBACK_LANGUAGES: LanguageOption[] = [
  { id: "fallback-en", name: "English", dialect: null },
];

/** Voice recording flow: language + daily prompt, MediaRecorder capture, preview, publish. */
export function VoiceRecorder() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const recorder = useMediaRecorder();

  const { data: languageRows } = useLanguages();
  const languages = languageRows?.length ? languageRows : FALLBACK_LANGUAGES;

  const [languageId, setLanguageId] = useState<string | null>(null);
  const selectedLanguage =
    languages.find((l) => l.id === languageId) ?? languages[0];
  const language = selectedLanguage.name;
  const [customPrompt, setCustomPrompt] = useState("");
  const [translation, setTranslation] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isSpeakingFreely, setIsSpeakingFreely] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const hasChosenPrompt = !!selectedPromptId || isSpeakingFreely;
  const hasRecorded = recorder.status === "stopped" && !!recorder.blob;

  const { data: prompts, isLoading: promptsLoading } = useQuery({
    queryKey: ["daily-prompts", userId, language],
    queryFn: () => generateDailyPrompts(userId as string, language),
    enabled: !!userId,
  });

  const unusedPrompts = useMemo(
    () => (prompts ?? []).filter((p) => !p.is_used),
    [prompts]
  );

  // Auto-stop at the max duration so recordings stay a reasonable size.
  useEffect(() => {
    if (recorder.status === "recording" && recorder.duration >= MAX_DURATION_SEC) {
      recorder.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, recorder.duration]);

  // Build/revoke a blob URL for the playback preview.
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

  const handlePromptSelect = (id: string, text: string) => {
    setSelectedPromptId(id);
    setCustomPrompt(text);
    setIsSpeakingFreely(false);
  };

  const handleSpeakFreely = () => {
    setSelectedPromptId(null);
    setCustomPrompt("");
    setIsSpeakingFreely(true);
  };

  const handleChangePrompt = () => {
    setSelectedPromptId(null);
    setIsSpeakingFreely(false);
    setCustomPrompt("");
  };

  const handleToggleRecord = async () => {
    if (recorder.status === "recording") {
      recorder.stop();
      return;
    }
    if (!hasChosenPrompt) {
      toast.error("Choose a prompt or tap Speak Freely first.");
      return;
    }
    await recorder.start();
  };

  const handleDiscard = () => {
    recorder.reset();
  };

  const handlePublish = async () => {
    if (!userId) {
      toast.error("You need to be signed in to publish.");
      return;
    }
    if (!recorder.blob) return;

    const finalPhrase =
      customPrompt.trim() || (isSpeakingFreely ? "Free recording" : "");
    if (!finalPhrase) {
      toast.error("Add a prompt describing your recording.");
      return;
    }

    // Same monetization floor the mobile recorder enforces before saving.
    if (recorder.duration < MIN_DURATION_SEC) {
      toast.error(
        `Recordings must be at least ${MIN_DURATION_SEC}s to qualify for monetization.`
      );
      return;
    }

    setIsSaving(true);
    try {
      const { publicUrl } = await uploadAudio(userId, recorder.blob);

      // Column set mirrors the mobile `saveVoiceClip` insert so rows written by
      // either client are indistinguishable downstream.
      const { error } = await supabase.from("voice_clips").insert({
        user_id: userId,
        phrase: finalPhrase,
        translation: translation.trim() || "",
        language,
        dialect: selectedLanguage.dialect || null,
        audio_url: publicUrl,
        duration: Math.round(recorder.duration),
        clip_type: "original",
        original_clip_id: null,
      });
      if (error) throw error;

      if (selectedPromptId) await markPromptAsUsed(selectedPromptId);
      analytics.track("voice_clip_published", { language });

      toast.success("Clip published!");
      router.push("/library");
    } catch (err) {
      console.error("[VoiceRecorder] publish error:", err);
      toast.error("Failed to publish. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const promptCardTitle = isSpeakingFreely ? "Free Recording" : "Your Prompt";

  return (
    <div className="flex flex-col gap-5">
      {/* Language picker */}
      <GlassCard className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20">
          <Globe className="h-4.5 w-4.5 text-[var(--color-primary)]" />
        </div>
        <label className="flex-1">
          <span className="sr-only">Language</span>
          <select
            value={selectedLanguage.id}
            onChange={(e) => {
              setLanguageId(e.target.value);
              setSelectedPromptId(null);
              setIsSpeakingFreely(false);
              setCustomPrompt("");
            }}
            disabled={recorder.status === "recording"}
            className="w-full appearance-none bg-transparent text-[15px] font-medium text-[var(--foreground)] outline-none disabled:opacity-60"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-[var(--surface)]">
                {lang.dialect ? `${lang.name} (${lang.dialect})` : lang.name}
              </option>
            ))}
          </select>
        </label>
      </GlassCard>

      {/* Daily prompts, shown until a prompt is chosen and nothing recorded yet */}
      {!hasChosenPrompt && !hasRecorded && (
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
              Daily Prompts
            </h2>
            <button
              onClick={handleSpeakFreely}
              className="flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]"
            >
              <Mic className="h-3.5 w-3.5" />
              Speak Freely
            </button>
          </div>

          {promptsLoading ? (
            <div className="h-16 animate-pulse rounded-xl bg-[var(--input)]" />
          ) : unusedPrompts.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() =>
                  handlePromptSelect(
                    unusedPrompts[promptIndex % unusedPrompts.length].id,
                    unusedPrompts[promptIndex % unusedPrompts.length].prompt_text
                  )
                }
                className="rounded-xl border border-[var(--border-light)] bg-[var(--input)] p-4 text-left text-[15px] text-[var(--foreground)] transition hover:border-[var(--color-primary)]"
              >
                {unusedPrompts[promptIndex % unusedPrompts.length].prompt_text}
              </button>
              {unusedPrompts.length > 1 && (
                <button
                  onClick={() => setPromptIndex((i) => i + 1)}
                  className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  Shuffle Prompt
                </button>
              )}
            </div>
          ) : (
            <p className="py-2 text-sm text-[var(--muted)]">
              No prompts left today — try Speak Freely instead.
            </p>
          )}
        </GlassCard>
      )}

      {/* Editable prompt / phrase card, once a prompt is chosen (or after recording) */}
      {(hasChosenPrompt || hasRecorded) && (
        <GlassCard className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
              {promptCardTitle}
            </h2>
            {!hasRecorded && (
              <button
                onClick={handleChangePrompt}
                className="text-xs font-bold text-[var(--color-primary)]"
              >
                Change Prompt
              </button>
            )}
          </div>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={recorder.status === "recording"}
            placeholder={
              isSpeakingFreely
                ? "Write what you're saying (optional)…"
                : "What are you saying?"
            }
            rows={3}
            className="w-full resize-none rounded-xl border border-transparent bg-[var(--input)] p-3.5 text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-primary)] disabled:opacity-60"
          />
        </GlassCard>
      )}

      {/* Recording area */}
      <div className="flex flex-col items-center gap-4 py-6">
        {(recorder.status === "recording" || hasRecorded) && (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums text-[var(--foreground)]">
              {formatDuration(recorder.duration)}
            </span>
            <span className="text-lg text-[var(--muted)]">
              / {formatDuration(MAX_DURATION_SEC)}
            </span>
          </div>
        )}

        <div className="relative flex h-24 w-24 items-center justify-center">
          {recorder.status === "recording" && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-40 animate-ping"
            />
          )}
          <button
            onClick={handleToggleRecord}
            disabled={hasRecorded}
            aria-label={recorder.status === "recording" ? "Stop recording" : "Start recording"}
            style={
              recorder.status === "recording"
                ? { transform: `scale(${1 + recorder.level * 0.15})` }
                : undefined
            }
            className={cn(
              "relative z-10 flex h-20 w-20 items-center justify-center rounded-full shadow-glow transition-transform",
              recorder.status === "recording"
                ? "bg-[var(--error)]"
                : "bg-brand-gradient"
            )}
          >
            {recorder.status === "recording" ? (
              <Square className="h-7 w-7 text-white" fill="currentColor" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </button>
        </div>

        <p className="text-sm text-[var(--muted)]">
          {recorder.status === "recording"
            ? "Recording…"
            : hasRecorded
              ? "Recorded!"
              : "Tap to record"}
        </p>

        {hasRecorded && objectUrl && (
          <div className="w-full max-w-sm">
            <WaveformPlayer src={objectUrl} duration={Math.round(recorder.duration)} />
          </div>
        )}
      </div>

      {hasRecorded && (
        <>
          <GlassCard className="p-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--color-primary)]">
              Translation (optional)
            </label>
            <input
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="English translation…"
              className="w-full rounded-xl border border-transparent bg-[var(--input)] p-3.5 text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-primary)]"
            />
          </GlassCard>

          <div className="flex gap-3">
            <button
              onClick={handleDiscard}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--input)] py-3.5 text-sm font-bold text-[var(--error)] transition hover:brightness-95 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Discard
            </button>
            <PrimaryButton
              onClick={handlePublish}
              loading={isSaving}
              leftIcon={<Wand2 className="h-4 w-4" />}
              className="flex-[2]"
            >
              Publish
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}
