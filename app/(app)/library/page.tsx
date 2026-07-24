"use client";

/** Owner: Agent 14 — Library page: voice/video/story tabs backed by Supabase, delete-with-optimistic-update for voice clips. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Video as VideoIcon, BookOpen } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SegmentedTabs, EmptyState, Spinner, PrimaryButton } from "@/components/ui";
import { useCurrentUserId } from "@/lib/query/hooks";
import type { VoiceClipRow, VideoClipRow, StoryRow } from "@/lib/types";
import {
  useVoiceClips,
  useVideoClips,
  useStories,
  useDeleteVoiceClip,
} from "./hooks";
import { VoiceClipCard } from "./VoiceClipCard";
import { VideoClipCard } from "./VideoClipCard";
import { StoryCard } from "./StoryCard";

type TabKey = "voice" | "video" | "story";

const TABS = [
  { key: "voice", label: "Voice Clips", icon: <Mic className="h-4 w-4" /> },
  { key: "video", label: "Video Clips", icon: <VideoIcon className="h-4 w-4" /> },
  { key: "story", label: "Stories", icon: <BookOpen className="h-4 w-4" /> },
];

export default function LibraryPage() {
  const [tab, setTab] = useState<TabKey>("voice");
  const userId = useCurrentUserId();

  const voiceQuery = useVoiceClips(userId);
  const videoQuery = useVideoClips(userId);
  const storyQuery = useStories(userId);
  const deleteVoiceClip = useDeleteVoiceClip(userId);

  const activeQuery =
    tab === "voice" ? voiceQuery : tab === "video" ? videoQuery : storyQuery;

  const deletingId = deleteVoiceClip.isPending
    ? deleteVoiceClip.variables?.id ?? null
    : null;

  return (
    <PageContainer size="lg">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)]">
          Library
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Everything you&apos;ve contributed, in one place.
        </p>
      </div>

      <SegmentedTabs
        tabs={TABS}
        value={tab}
        onChange={(key) => setTab(key as TabKey)}
        variant="pill"
        className="mb-6"
      />

      {!userId || activeQuery.isLoading ? (
        <Spinner />
      ) : activeQuery.isError ? (
        <EmptyState
          title="Couldn't load your library"
          message="Something went wrong loading this tab. Please try again shortly."
        />
      ) : tab === "voice" ? (
        <VoiceTab
          clips={voiceQuery.data ?? []}
          onDelete={(clip) => deleteVoiceClip.mutate(clip)}
          deletingId={deletingId}
        />
      ) : tab === "video" ? (
        <VideoTab clips={videoQuery.data ?? []} />
      ) : (
        <StoryTab stories={storyQuery.data ?? []} />
      )}
    </PageContainer>
  );
}

function RecordCta({ label }: { label: string }) {
  const router = useRouter();
  return (
    <PrimaryButton size="md" fullWidth={false} onClick={() => router.push("/record")}>
      {label}
    </PrimaryButton>
  );
}

function VoiceTab({
  clips,
  onDelete,
  deletingId,
}: {
  clips: VoiceClipRow[];
  onDelete: (clip: VoiceClipRow) => void;
  deletingId: string | null;
}) {
  if (clips.length === 0) {
    return (
      <EmptyState
        icon={<Mic className="h-7 w-7" />}
        title="No voice clips yet"
        message="Start recording to build your personal language archive."
        action={<RecordCta label="Record New" />}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {clips.map((clip) => (
        <VoiceClipCard
          key={clip.id}
          clip={clip}
          deleting={deletingId === clip.id}
          onDelete={() => onDelete(clip)}
        />
      ))}
    </div>
  );
}

function VideoTab({ clips }: { clips: VideoClipRow[] }) {
  if (clips.length === 0) {
    return (
      <EmptyState
        icon={<VideoIcon className="h-7 w-7" />}
        title="No videos yet"
        message="Record or upload a video from the Create button to see it here."
        action={<RecordCta label="Record New" />}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {clips.map((clip) => (
        <VideoClipCard key={clip.id} clip={clip} />
      ))}
    </div>
  );
}

function StoryTab({ stories }: { stories: StoryRow[] }) {
  if (stories.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-7 w-7" />}
        title="No stories yet"
        message="Tell your first story and watch it come to life."
        action={<RecordCta label="Record New" />}
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}
