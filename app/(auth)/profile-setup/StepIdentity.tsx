"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, MapPin, Map, User } from "lucide-react";
import { Field, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { uploadAvatar } from "@/lib/storage";
import { AVATAR_SEEDS, dicebearUrl } from "./country-data";
import toast from "react-hot-toast";

/** Step 2 — username/state/city + avatar (upload or DiceBear cartoon pick). */
export function StepIdentity({
  userId,
  username,
  onUsernameChange,
  state,
  onStateChange,
  city,
  onCityChange,
  avatarUrl,
  onAvatarChange,
}: {
  userId: string | null;
  username: string;
  onUsernameChange: (v: string) => void;
  state: string;
  onStateChange: (v: string) => void;
  city: string;
  onCityChange: (v: string) => void;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file || !userId) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadAvatar(userId, file);
      onAvatarChange(publicUrl);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error("Could not upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const isUploadedPhoto =
    avatarUrl && !AVATAR_SEEDS.some((s) => dicebearUrl(s) === avatarUrl);

  return (
    <div>
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-[32px]">
        Your <span className="text-brand-gradient">Identity</span>
      </h1>
      <p className="mb-8 mt-2 text-[15px] leading-snug text-[var(--muted)]">
        How should the community recognize you?
      </p>

      <div className="flex flex-col gap-5">
        <Field label="Username" hint="Letters, numbers and underscores. At least 3 characters.">
          <Input
            variant="glass"
            icon={User}
            placeholder="tunde_heritage"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </Field>
        <Field label="State / Region">
          <Input
            variant="glass"
            icon={Map}
            placeholder="Lagos"
            autoComplete="address-level1"
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
          />
        </Field>
        <Field label="Town / City" optional>
          <Input
            variant="glass"
            icon={MapPin}
            placeholder="Ikeja"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-10">
        <p className="mb-1 text-[13px] font-semibold text-[var(--foreground)]">
          Choose an avatar vibe
        </p>
        <p className="mb-3 text-[12px] text-[var(--muted-2)]">
          Upload a photo or pick one of the cartoon avatars.
        </p>
        <div className="no-scrollbar -mx-1 flex gap-3.5 overflow-x-auto px-1 pb-2 pt-1">
          <button
            type="button"
            disabled={uploading}
            aria-label="Upload a photo"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition disabled:opacity-70",
              "border-[var(--color-primary)] bg-[var(--input)] hover:bg-[var(--color-primary)]/10"
            )}
          >
            {isUploadedPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl as string}
                alt="Uploaded avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-[var(--color-primary)]" />
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {AVATAR_SEEDS.map((seed) => {
            const url = dicebearUrl(seed);
            const selected = avatarUrl === url;
            return (
              <button
                type="button"
                key={seed}
                aria-label={`Avatar ${seed}`}
                aria-pressed={selected}
                onClick={() => onAvatarChange(url)}
                className={cn(
                  // ring rather than a border swap — a 1px→2px border would
                  // nudge the image and jitter the row on selection.
                  "h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--input)] ring-1 ring-[var(--border-light)] transition hover:ring-[var(--muted-2)]",
                  selected &&
                    "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--background)] hover:ring-[var(--color-primary)]"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Avatar ${seed}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
