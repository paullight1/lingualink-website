"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { ChevronRight } from "lucide-react";
import { PrimaryButton, StepProgress } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import {
  useCurrentUserId,
  useMyProfile,
  useInvalidateMyProfile,
} from "@/lib/query/hooks";
import { normalizeUsername } from "@/lib/utils";
import { StepHeritage } from "./StepHeritage";
import { StepIdentity } from "./StepIdentity";
import { COUNTRIES, type Country, type Language } from "./country-data";

/**
 * Owner: Agent 4 — 2-step profile-setup wizard (Heritage: country + languages,
 * Identity: username/location + avatar). Web port of mobile ModernProfileSetup.tsx.
 */
export default function ProfileSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const userId = useCurrentUserId();
  const { data: profile } = useMyProfile();
  const invalidateProfile = useInvalidateMyProfile();

  const [step, setStep] = useState<1 | 2>(1);
  const [country, setCountry] = useState<Country | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [username, setUsername] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // Prefill from an existing (in-progress) profile row, once it's loaded.
  useEffect(() => {
    if (prefilled) return;
    if (!profile && !user) return;

    if (profile?.username) setUsername(normalizeUsername(profile.username));
    else if (user?.username) setUsername(normalizeUsername(user.username));

    if (profile?.state) setStateRegion(profile.state);
    if (profile?.city) setCity(profile.city);
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

    if (profile?.country) {
      const match = COUNTRIES.find((c) => c.name === profile.country);
      if (match) {
        setCountry(match);
        if (profile.interests?.length) {
          setLanguages(
            profile.interests.map(
              (name): Language =>
                match.languages.find((l) => l.name === name) ?? {
                  name,
                  code: `custom_${name}`,
                }
            )
          );
        }
      }
    }
    setPrefilled(true);
  }, [profile, user, prefilled]);

  const goNext = () => {
    if (step === 1) {
      if (!country) {
        toast.error("Please select your country to proceed.");
        return;
      }
      if (languages.length === 0) {
        toast.error("Please select at least one language you speak.");
        return;
      }
      setStep(2);
      return;
    }
    void finish();
  };

  const finish = async () => {
    if (!userId) return;
    const normalized = normalizeUsername(username);
    if (normalized.length < 3) {
      toast.error("Username must be at least 3 characters long.");
      return;
    }
    if (!stateRegion.trim()) {
      toast.error("Please provide your state.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: conflict, error: conflictError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", normalized)
        .neq("id", userId)
        .maybeSingle();
      if (conflictError) throw conflictError;
      if (conflict) {
        toast.error(
          "This username is already in use. Please choose another one."
        );
        return;
      }

      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          username: normalized,
          full_name: user?.fullName || user?.firstName || normalized,
          interests: languages.map((l) => l.name),
          country: country?.name ?? null,
          state: stateRegion.trim(),
          city: city.trim() || null,
          avatar_url: avatarUrl || user?.imageUrl || null,
          has_completed_onboarding: false,
        },
        { onConflict: "id" }
      );
      if (error) throw error;

      invalidateProfile();
      router.push("/interests");
    } catch (err) {
      console.error("Profile setup error:", err);
      const message = err instanceof Error ? err.message : "";
      const code = (err as { code?: string } | null)?.code;
      if (code === "23505" || message.includes("username")) {
        toast.error(
          "This username is already in use. Please choose another one."
        );
      } else {
        toast.error("Could not save profile. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] w-full flex-col">
      <StepProgress step={step} total={2} className="mb-8" />

      <div className="flex-1">
        {step === 1 ? (
          <StepHeritage
            country={country}
            onCountryChange={setCountry}
            languages={languages}
            onLanguagesChange={setLanguages}
          />
        ) : (
          <StepIdentity
            userId={userId}
            username={username}
            onUsernameChange={setUsername}
            state={stateRegion}
            onStateChange={setStateRegion}
            city={city}
            onCityChange={setCity}
            avatarUrl={avatarUrl}
            onAvatarChange={setAvatarUrl}
          />
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-5">
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-[13px] font-semibold tracking-[2px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            PREVIOUS STEP
          </button>
        )}
        <PrimaryButton
          size="lg"
          loading={submitting}
          rightIcon={!submitting && <ChevronRight className="h-5 w-5" />}
          onClick={goNext}
        >
          {step === 1 ? "Continue" : "Finish Setup"}
        </PrimaryButton>
      </div>
    </div>
  );
}
