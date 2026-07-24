"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, MapPin, Map, User } from "lucide-react";
import { GlassCard } from "@/components/ui";
import { cn } from "@/lib/utils";
import { uploadAvatar } from "@/lib/storage";
import { AVATAR_SEEDS, dicebearUrl } from "./country-data";
import toast from "react-hot-toast";

function InputGroup({
  label,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 block text-sm font-semibold tracking-wide text-[var(--muted)]">
        {label}
      </label>
      <GlassCard intensity={15} className="rounded-[20px]">
        <div className="flex h-16 items-center gap-3 px-4">
          <Icon className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
          <input
            autoCapitalize="none"
            className="h-full w-full bg-transparent text-[17px] font-medium text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            {...props}
          />
        </div>
      </GlassCard>
    </div>
  );
}

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
      <h1 className="text-[32px] font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-[34px]">
        Your <span className="text-[var(--color-primary)]">Identity</span>
      </h1>
      <p className="mb-8 mt-2 text-base text-[var(--muted)]">
        How should the community recognize you?
      </p>

      <div className="space-y-6">
        <InputGroup
          label="Username"
          icon={User}
          placeholder="e.g. tunde_heritage"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
        />
        <InputGroup
          label="State / Region"
          icon={Map}
          placeholder="e.g. Lagos"
          value={state}
          onChange={(e) => onStateChange(e.target.value)}
        />
        <InputGroup
          label="Town / City (optional)"
          icon={MapPin}
          placeholder="e.g. Ikeja"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
        />
      </div>

      <div className="mt-10">
        <label className="mb-3 block text-sm font-semibold tracking-wide text-[var(--muted)]">
          Choose an avatar vibe
        </label>
        <div className="flex gap-4 overflow-x-auto pb-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition disabled:opacity-70",
              "border-[var(--color-primary)] bg-[var(--input)]"
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
                onClick={() => onAvatarChange(url)}
                className={cn(
                  "h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border bg-[var(--input)] transition",
                  selected
                    ? "border-2 border-[var(--color-primary)]"
                    : "border-[var(--border-light)]"
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
