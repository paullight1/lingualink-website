"use client";

/** Built by Agent 11 — validate a single clip (approve/reject + flag). */

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, X as XIcon, Flag, Globe, PartyPopper } from "lucide-react";
import { AppHeader, WaveformPlayer, PrimaryButton, Spinner, EmptyState } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { supabase } from "@/lib/supabase/client";
import { monetizationApi } from "@/lib/api/monetization";
import { qk } from "@/lib/query/keys";
import { analytics } from "@/components/providers/PostHogProvider";
import type { VoiceClipRow } from "@/lib/types";
import { extractOriginalPrompt, type ActionResult, type FlagReason } from "../utils";
import { FlagModal } from "./FlagModal";

type ClipDetail = Pick<
  VoiceClipRow,
  "id" | "phrase" | "language" | "dialect" | "audio_url"
>;

async function fetchClip(clipId: string): Promise<ClipDetail | null> {
  const { data, error } = await supabase
    .from("voice_clips")
    .select("id, phrase, language, dialect, audio_url")
    .eq("id", clipId)
    .maybeSingle();
  if (error) throw error;
  return (data as ClipDetail) ?? null;
}

export default function ValidateClipPage() {
  const params = useParams<{ clipId: string }>();
  const clipId = params.clipId;
  const router = useRouter();

  const { data: clip, isLoading, isError } = useQuery({
    queryKey: qk.clip(clipId),
    enabled: !!clipId,
    queryFn: () => fetchClip(clipId),
  });

  const [showIncorrectPanel, setShowIncorrectPanel] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ isApproved: boolean; hint: string } | null>(
    null
  );
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagSubmitting, setFlagSubmitting] = useState(false);

  const submit = async (isApproved: boolean, note?: string) => {
    if (!clip?.id || submitting) return;
    setSubmitting(true);
    try {
      const quality = isApproved ? "excellent" : "poor";
      const res = (await monetizationApi.submitValidation(
        clip.id,
        isApproved,
        note,
        quality
      )) as ActionResult;

      if (res?.success === false) {
        toast.error(res.message || "Validation was not successful.");
        return;
      }

      analytics.track("validation_submitted", {
        clip_id: clip.id,
        is_correct: isApproved,
        quality,
        language: clip.language,
        consensus_reached: res?.consensusReached ?? false,
      });

      const hint = res?.consensusReached
        ? "Consensus reached — rewards have been distributed to contributors."
        : res?.reward
        ? `Thanks! You earned $${res.reward.toFixed(2)}.`
        : "Thanks for helping validate this clip!";

      setResult({ isApproved, hint });
      toast.success("Validation submitted");
      setShowIncorrectPanel(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit validation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFlag = async (reason: FlagReason["id"], details: string) => {
    if (!clip?.id) return;
    setFlagSubmitting(true);
    try {
      const res = (await monetizationApi.flagForReview(
        clip.id,
        reason,
        details
      )) as ActionResult;
      toast.success(res?.message || "Clip flagged for review.");
      setFlagOpen(false);
      router.push("/validate");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to flag clip");
    } finally {
      setFlagSubmitting(false);
    }
  };

  return (
    <div className="min-h-full">
      <AppHeader
        title="Validate Pronunciation"
        rightElement={
          <button
            type="button"
            onClick={() => setFlagOpen(true)}
            className="flex items-center gap-1 text-sm font-semibold text-[var(--error)]"
          >
            <Flag className="h-4 w-4" />
            Flag
          </button>
        }
      />

      <PageContainer size="sm">
        {isLoading && <Spinner />}

        {!isLoading && (isError || !clip) && (
          <EmptyState
            title="Clip not found"
            message="This clip may have already been validated or removed."
            action={
              <PrimaryButton onClick={() => router.push("/validate")}>
                Back to queue
              </PrimaryButton>
            }
          />
        )}

        {!isLoading && clip && !result && (
          <>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--input)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
              <Globe className="h-3.5 w-3.5" />
              {clip.language || "—"}
              {clip.dialect ? ` · ${clip.dialect}` : ""}
            </span>

            <div className="rounded-[18px] border border-[var(--border-light)] bg-[var(--card)] p-5 shadow-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Audio Clip
              </p>
              <p className="mb-5 text-center text-2xl font-bold leading-tight text-[var(--foreground)]">
                {extractOriginalPrompt(clip.phrase || "—")}
              </p>
              <WaveformPlayer src={clip.audio_url} seed={clip.id} />
            </div>

            {!showIncorrectPanel ? (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <PrimaryButton
                  variant="secondary"
                  size="lg"
                  leftIcon={<XIcon className="h-5 w-5" />}
                  disabled={submitting}
                  onClick={() => setShowIncorrectPanel(true)}
                  className="border-[var(--error)]/40 text-[var(--error)]"
                >
                  Incorrect
                </PrimaryButton>
                <PrimaryButton
                  variant="primary"
                  size="lg"
                  leftIcon={<Check className="h-5 w-5" />}
                  loading={submitting}
                  onClick={() => submit(true)}
                >
                  Correct
                </PrimaryButton>
              </div>
            ) : (
              <div className="mt-6 rounded-[18px] border border-[var(--border-light)] bg-[var(--card)] p-4">
                <p className="mb-2 text-sm font-semibold text-[var(--foreground)]">
                  What&apos;s wrong with this clip? (optional)
                </p>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. wrong dialect, mispronounced word…"
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-[var(--border-light)] bg-[var(--input)] p-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--color-primary)]"
                />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <PrimaryButton
                    variant="ghost"
                    disabled={submitting}
                    onClick={() => setShowIncorrectPanel(false)}
                  >
                    Cancel
                  </PrimaryButton>
                  <PrimaryButton
                    variant="danger"
                    loading={submitting}
                    onClick={() => submit(false, feedback || undefined)}
                  >
                    Submit
                  </PrimaryButton>
                </div>
              </div>
            )}
          </>
        )}

        {result && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
              <PartyPopper className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Validation submitted
            </h2>
            <p className="max-w-xs text-sm text-[var(--muted)]">{result.hint}</p>
            <PrimaryButton onClick={() => router.push("/validate")}>
              Next clip
            </PrimaryButton>
          </div>
        )}
      </PageContainer>

      <FlagModal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        onSubmit={handleFlag}
        submitting={flagSubmitting}
      />
    </div>
  );
}
