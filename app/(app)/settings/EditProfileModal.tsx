"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { PrimaryButton } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";

/** Edit-profile sheet: full name + bio, upserted onto the caller's `profiles` row. */
export function EditProfileModal({
  userId,
  initialFullName,
  initialBio,
  onClose,
  onSaved,
}: {
  userId: string;
  initialFullName: string;
  initialBio: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(initialFullName);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Profile updated");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-[32px] border border-[var(--border-light)] bg-[var(--surface)] p-6 pb-8 shadow-lg sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Edit Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Full name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={80}
          placeholder="Your name"
          className="mb-4 w-full rounded-xl border border-[var(--border-light)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
        />

        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
          placeholder="Tell people about yourself"
          className="mb-2 w-full resize-none rounded-xl border border-[var(--border-light)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
        />
        <p className="mb-4 text-right text-[11px] text-[var(--muted)]">{bio.length}/200</p>

        <div className="flex gap-3">
          <PrimaryButton variant="outline" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </PrimaryButton>
          <PrimaryButton size="md" onClick={handleSave} loading={saving}>
            Save
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
