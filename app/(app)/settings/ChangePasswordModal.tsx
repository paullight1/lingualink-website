"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import {
  Field,
  ModalSheet,
  PasswordInput,
  PrimaryButton,
} from "@/components/ui";

/** Change-password sheet backed by Clerk's `user.updatePassword`. */
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!user) {
      toast.error("Not signed in");
      return;
    }
    setSaving(true);
    try {
      await user.updatePassword({
        newPassword,
        currentPassword: currentPassword || undefined,
        signOutOfOtherSessions: true,
      });
      toast.success("Password updated");
      onClose();
    } catch (err) {
      const message =
        err && typeof err === "object" && "errors" in err
          ? // Clerk errors carry a `.errors[0].message` shape.
            (err as { errors?: Array<{ message?: string }> }).errors?.[0]?.message
          : undefined;
      toast.error(message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const mismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword
      ? "Passwords do not match"
      : "";

  return (
    <ModalSheet
      onClose={onClose}
      title="Change password"
      description="You'll be signed out of your other devices."
      footer={
        <div className="flex gap-3">
          <PrimaryButton variant="outline" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </PrimaryButton>
          <PrimaryButton size="md" onClick={handleSave} loading={saving}>
            Update
          </PrimaryButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Current password" optional hint="Leave blank if you signed up with Google.">
          <PasswordInput
            icon={Lock}
            size="md"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>

        <Field label="New password" hint="At least 8 characters.">
          <PasswordInput
            icon={Lock}
            size="md"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirm new password" error={mismatch}>
          <PasswordInput
            icon={Lock}
            size="md"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
      </div>
    </ModalSheet>
  );
}
