"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { User } from "lucide-react";
import {
  Field,
  Input,
  ModalSheet,
  PrimaryButton,
  Textarea,
} from "@/components/ui";
import { supabase } from "@/lib/supabase/client";

const BIO_MAX = 200;

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
    <ModalSheet
      onClose={onClose}
      title="Edit profile"
      footer={
        <div className="flex gap-3">
          <PrimaryButton variant="outline" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </PrimaryButton>
          <PrimaryButton size="md" onClick={handleSave} loading={saving}>
            Save
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Full name">
          <Input
            icon={User}
            size="md"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={80}
            placeholder="Your name"
            autoComplete="name"
          />
        </Field>

        <Field label="Bio" optional counter={{ value: bio.length, max: BIO_MAX }}>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={3}
            placeholder="Tell people about yourself"
          />
        </Field>
      </div>
    </ModalSheet>
  );
}
