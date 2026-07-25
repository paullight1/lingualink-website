"use client";

/** Go live: title + language, then start a broadcast room. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Radio } from "lucide-react";
import toast from "react-hot-toast";

import {
  AppHeader,
  Field,
  GlassCard,
  Input,
  PrimaryButton,
  Select,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useLanguages, uniqueLanguageNames } from "@/lib/query/hooks";
import { startStream } from "@/lib/api/live";
import { analytics } from "@/components/providers/PostHogProvider";

const TITLE_MAX = 80;

export default function GoLivePage() {
  const router = useRouter();
  const { data: languages } = useLanguages();

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("English");
  const [starting, setStarting] = useState(false);

  const handleGoLive = async () => {
    if (!title.trim() || starting) return;
    setStarting(true);
    try {
      const { roomId } = await startStream(title.trim(), language);
      analytics.track("live_stream_started", { language });
      router.replace(`/live/${roomId}?host=1`);
    } catch (err) {
      console.error("[live] start failed", err);
      toast.error(
        err instanceof Error ? err.message : "Couldn't start your stream"
      );
      setStarting(false);
    }
  };

  return (
    <div className="min-h-full">
      <AppHeader title="Go Live" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        <GlassCard className="mb-5 flex flex-col items-center gap-3 p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--error)]/15 text-[var(--error)]">
            <Radio className="h-7 w-7" />
          </span>
          <h1 className="text-xl font-extrabold text-[var(--foreground)]">
            Start a live session
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Teach a phrase, tell a story, or just talk. Anyone can drop in.
          </p>
        </GlassCard>

        <div className="mb-6 flex flex-col gap-4">
          <Field
            label="Stream title"
            counter={{ value: title.length, max: TITLE_MAX }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="Yoruba greetings for beginners"
            />
          </Field>

          <Field label="Language">
            <Select
              icon={Globe}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {uniqueLanguageNames(languages).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <PrimaryButton
          size="lg"
          loading={starting}
          disabled={!title.trim() || starting}
          onClick={handleGoLive}
          leftIcon={<Radio className="h-5 w-5" />}
        >
          Go Live
        </PrimaryButton>
      </PageContainer>
    </div>
  );
}
