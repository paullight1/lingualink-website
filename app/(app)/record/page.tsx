"use client";

// Built by Agent 8 (voice): record page shell, mode toggle, VoiceRecorder.
// Video mode renders <VideoRecorder> (owned by Agent 9) from ./VideoRecorder.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader, SegmentedTabs } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { VoiceRecorder } from "./VoiceRecorder";
import { VideoRecorder } from "./VideoRecorder";

type Mode = "voice" | "video";

function RecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "video" ? "video" : "voice";
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <>
      <AppHeader title="Record" />
      <PageContainer size="sm">
        <SegmentedTabs
          className="mb-5"
          variant="pill"
          value={mode}
          onChange={(key) => setMode(key as Mode)}
          tabs={[
            { key: "voice", label: "Voice" },
            { key: "video", label: "Video" },
          ]}
        />

        {mode === "voice" ? (
          <VoiceRecorder />
        ) : (
          <VideoRecorder onPublished={() => router.push("/library")} />
        )}
      </PageContainer>
    </>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={null}>
      <RecordContent />
    </Suspense>
  );
}
