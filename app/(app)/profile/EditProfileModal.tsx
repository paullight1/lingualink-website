"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { PrimaryButton, UserAvatar } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/storage";
import { useInvalidateMyProfile } from "@/lib/query/hooks";
import type { ProfileRow } from "@/lib/types";

/** Bottom-sheet (mobile) / centered dialog (desktop) to edit full_name, bio & avatar. */
export function EditProfileModal({
  open,
  onClose,
  profile,
  userId,
}: {
  open: boolean;
  onClose: () => void;
  profile?: ProfileRow | null;
  userId: string;
}) {
  const invalidateProfile = useInvalidateMyProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFullName(profile?.full_name ?? "");
      setBio(profile?.bio ?? "");
      setAvatarUrl(profile?.avatar_url ?? "");
    }
  }, [open, profile]);

  if (!open) return null;

  const handleAvatarPick = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadAvatar(userId, file);
      setAvatarUrl(publicUrl);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
      if (error) throw error;

      invalidateProfile();
      toast.success("Profile updated");
      onClose();
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-[24px] border border-[var(--border-light)] bg-[var(--card)] p-6 sm:max-w-md sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Edit Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="relative">
            <UserAvatar uri={avatarUrl} name={fullName} size={88} ring />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Change avatar"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarPick(e.target.files?.[0])}
            />
          </div>
        </div>

        <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
          Full Name
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="mb-4 w-full rounded-[12px] border border-[var(--border-light)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
        />

        <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 150))}
          placeholder="Tell us about yourself..."
          rows={4}
          className="mb-1 w-full resize-none rounded-[12px] border border-[var(--border-light)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
        />
        <p className="mb-6 text-right text-xs text-[var(--muted)]">{bio.length}/150</p>

        <PrimaryButton onClick={handleSave} loading={saving} disabled={uploading}>
          Save Changes
        </PrimaryButton>
      </div>
    </div>
  );
}
