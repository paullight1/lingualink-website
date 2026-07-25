"use client";

/** Create a story: pick or capture media, add a caption, publish (expires in 24h). */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Camera, X, Clock } from "lucide-react";
import toast from "react-hot-toast";

import { AppHeader, Field, PrimaryButton, Textarea } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId } from "@/lib/query/hooks";
import { createStory, isVideoUrl } from "@/lib/api/stories";
import { analytics } from "@/components/providers/PostHogProvider";

const MAX_CAPTION = 200;
const MAX_FILE_MB = 50;

export default function CreateStoryPage() {
  const router = useRouter();
  const userId = useCurrentUserId();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [publishing, setPublishing] = useState(false);

  const pickRef = useRef<HTMLInputElement | null>(null);
  const captureRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSelect = (selected: File | undefined) => {
    if (!selected) return;
    if (selected.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Please pick a file under ${MAX_FILE_MB}MB.`);
      return;
    }
    setFile(selected);
  };

  const handlePublish = async () => {
    if (!userId) {
      toast.error("You need to be signed in to post a story.");
      return;
    }
    if (!file || publishing) return;

    setPublishing(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      await createStory({ userId, file, caption: caption.trim(), ext });
      analytics.track("story_published", { has_caption: !!caption.trim() });
      toast.success("Story posted!");
      router.push("/feed");
    } catch (err) {
      console.error("[CreateStory] publish failed", err);
      toast.error("Couldn't post your story. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const previewIsVideo = !!file && file.type.startsWith("video/");

  return (
    <div className="min-h-full">
      <AppHeader title="New Story" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        <input
          ref={pickRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => handleSelect(e.target.files?.[0])}
        />
        <input
          ref={captureRef}
          type="file"
          accept="image/*"
          capture="user"
          hidden
          onChange={(e) => handleSelect(e.target.files?.[0])}
        />

        {!file ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => pickRef.current?.click()}
              className="flex items-center gap-3 rounded-[16px] border border-[var(--border-light)] p-4 text-left transition hover:bg-[var(--input)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <ImagePlus className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-[var(--foreground)]">
                  Choose a photo or video
                </span>
                <span className="block text-sm text-[var(--muted)]">
                  From your device
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => captureRef.current?.click()}
              className="flex items-center gap-3 rounded-[16px] border border-[var(--border-light)] p-4 text-left transition hover:bg-[var(--input)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-purple)]/10 text-[var(--color-accent-purple)]">
                <Camera className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-[var(--foreground)]">
                  Take a photo
                </span>
                <span className="block text-sm text-[var(--muted)]">
                  Use your camera
                </span>
              </span>
            </button>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
              <Clock className="h-3.5 w-3.5" />
              Stories disappear after 24 hours
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[16px] bg-black">
              {previewIsVideo ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={previewUrl ?? undefined}
                  controls
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl ?? undefined}
                  alt="Story preview"
                  className="h-full w-full object-contain"
                />
              )}
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove media"
                className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Field
              label="Caption"
              optional
              counter={{ value: caption.length, max: MAX_CAPTION }}
            >
              <Textarea
                variant="glass"
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                rows={3}
                placeholder="Say something about this story…"
              />
            </Field>

            <PrimaryButton
              size="lg"
              loading={publishing}
              disabled={publishing}
              onClick={handlePublish}
            >
              Share Story
            </PrimaryButton>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
