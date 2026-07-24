"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { PrimaryButton } from "@/components/ui";

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
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Change Password</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
          Current password (if set)
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className="mb-4 w-full rounded-xl border border-[var(--border-light)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
        />

        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          className="mb-4 w-full rounded-xl border border-[var(--border-light)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
        />

        <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
          Confirm new password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          className="mb-6 w-full rounded-xl border border-[var(--border-light)] bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-primary)]"
        />

        <div className="flex gap-3">
          <PrimaryButton variant="outline" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </PrimaryButton>
          <PrimaryButton size="md" onClick={handleSave} loading={saving}>
            Update
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
