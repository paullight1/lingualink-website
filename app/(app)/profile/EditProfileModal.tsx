"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import {
  Field,
  Input,
  ModalSheet,
  PrimaryButton,
  Textarea,
  UserAvatar,
} from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/storage";
import { useInvalidateMyProfile } from "@/lib/query/hooks";
import type { ProfileRow } from "@/lib/types";

const BIO_MAX = 150;

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
    <ModalSheet
      onClose={onClose}
      title="Edit profile"
      size="md"
      footer={
        <PrimaryButton onClick={handleSave} loading={saving} disabled={uploading}>
          Save Changes
        </PrimaryButton>
      }
    >
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <UserAvatar uri={avatarUrl} name={fullName} size={88} ring />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Change avatar"
            className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--surface)] bg-brand-gradient text-white shadow-glow disabled:opacity-60"
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

      <div className="flex flex-col gap-4">
        <Field label="Full name">
          <Input
            icon={User}
            size="md"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            maxLength={80}
          />
        </Field>

        <Field label="Bio" optional counter={{ value: bio.length, max: BIO_MAX }}>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
            placeholder="Tell us about yourself…"
            rows={4}
          />
        </Field>
      </div>
    </ModalSheet>
  );
}
