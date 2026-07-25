"use client";

/** Owner: Agent 5 — 2-step onboarding: pick up to 3 interests, then follow suggestions. */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { PrimaryButton, Spinner, EmptyState, StepProgress } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import {
  useCurrentUserId,
  useMyProfile,
  useInvalidateMyProfile,
} from "@/lib/query/hooks";
import { analytics } from "@/components/providers/PostHogProvider";
import { INTERESTS } from "./data";
import { InterestCard } from "./InterestCard";
import { SuggestedUserCard } from "./SuggestedUserCard";
import { useSuggestedUsers, type SuggestedUser } from "./useSuggestedUsers";

const MAX_INTERESTS = 3;

export default function InterestsPage() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const { data: myProfile } = useMyProfile();
  const invalidateMyProfile = useInvalidateMyProfile();

  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [follows, setFollows] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: suggestions, isLoading: usersLoading } = useSuggestedUsers(
    userId,
    step === 2
  );

  // Seed the local follow-toggle map once suggestions arrive.
  const users: SuggestedUser[] = useMemo(() => {
    if (!suggestions) return [];
    return suggestions.map((u) => ({
      ...u,
      is_following: follows[u.id] ?? u.is_following,
    }));
  }, [suggestions, follows]);

  function toggleInterest(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= MAX_INTERESTS) {
        toast.error("You can select up to 3 interests only.");
        return prev;
      }
      return [...prev, id];
    });
  }

  function toggleFollow(id: string) {
    setFollows((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? users.find((u) => u.id === id)?.is_following),
    }));
  }

  function handleContinue() {
    if (selected.length === 0) {
      toast.error("Please select at least one interest to proceed.");
      return;
    }
    setStep(2);
  }

  async function handleFinish() {
    if (!userId) return;
    setIsSaving(true);
    try {
      // Merge new interests with any the user already had on file.
      const existing = myProfile?.interests ?? [];
      const merged = Array.from(new Set([...existing, ...selected]));

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          interests: merged,
          has_completed_onboarding: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (profileError) throw profileError;

      const toFollow = users.filter((u) => u.is_following);
      if (toFollow.length > 0) {
        const rows = toFollow.map((u) => ({
          follower_id: userId,
          following_id: u.id,
        }));
        const { error: followError } = await supabase
          .from("followers")
          .upsert(rows, { onConflict: "follower_id,following_id", ignoreDuplicates: true });
        if (followError) throw followError;
      }

      analytics.track("onboarding_interests_completed", {
        interests: merged,
        followed_count: toFollow.length,
      });
      // Await the refetch: OnboardingGate reads this cache entry, and
      // navigating while it still holds `has_completed_onboarding: false`
      // bounces the user straight back to this page.
      await invalidateMyProfile();
      router.push("/feed");
    } catch (err) {
      console.error("Error finishing interest setup:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-5 px-1 text-center">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--foreground)] sm:text-[32px]">
          {step === 1 ? "Tailor your feed" : "Connect with others"}
        </h1>
        <p className="mt-2 text-[15px] leading-snug text-[var(--muted)]">
          {step === 1
            ? "Choose what you love to see relevant content"
            : "Follow people who share your interests"}
        </p>
      </div>

      <StepProgress step={step} total={2} className="mb-6" />

      {step === 1 ? (
        <div>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-[17px] font-bold tracking-tight text-[var(--foreground)]">
              Select up to 3 interests
            </h2>
            <span className="shrink-0 text-[12px] font-semibold tabular-nums text-[var(--muted-2)]">
              {selected.length}/{MAX_INTERESTS}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {INTERESTS.map((interest) => (
              <InterestCard
                key={interest.id}
                interest={interest}
                selected={selected.includes(interest.id)}
                onToggle={() => toggleInterest(interest.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h2 className="mb-4 text-[17px] font-bold tracking-tight text-[var(--foreground)]">
            Recommended for you
          </h2>

          {usersLoading ? (
            <Spinner />
          ) : users.length === 0 ? (
            <EmptyState
              title="No suggestions yet"
              message="You can follow people later from your feed."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {users.map((u) => (
                <SuggestedUserCard
                  key={u.id}
                  user={u}
                  onToggleFollow={() => toggleFollow(u.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <PrimaryButton
          onClick={step === 1 ? handleContinue : handleFinish}
          loading={isSaving}
          rightIcon={!isSaving ? <ChevronRight className="h-5 w-5" /> : undefined}
        >
          {isSaving ? "Saving..." : step === 1 ? "Continue" : "Finish Setup"}
        </PrimaryButton>
      </div>
    </div>
  );
}
