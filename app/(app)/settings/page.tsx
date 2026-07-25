"use client";

/**
 * Owner: Agent 20 — Settings page: Account, Referrals, Appearance, Language,
 * Notifications, About, Sign out. Web port of mobile SettingsScreen.tsx.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  Award,
  Check,
  Copy,
  Download,
  FileText,
  Globe,
  Heart,
  Info,
  Lock,
  LogOut,
  Mail,
  MessageCircleReply,
  Monitor,
  Moon,
  Shield,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { AppHeader, PrimaryButton, SettingsSection, SettingsItem, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useTheme } from "@/components/providers/ThemeProvider";
import { supabase } from "@/lib/supabase/client";
import { useCurrentUserId, useInvalidateMyProfile, useMyProfile } from "@/lib/query/hooks";
import { APP_VERSION } from "@/lib/config";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "./EditProfileModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { LanguageModal } from "./LanguageModal";
import { ToggleSwitch } from "./ToggleSwitch";
import { useNotificationPrefs, useReferralInfo } from "./hooks";

const SUPPORT_EMAIL = "hello@lingualink.app";

export default function SettingsPage() {
  const router = useRouter();
  const { signOut } = useClerk();
  const userId = useCurrentUserId();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const invalidateProfile = useInvalidateMyProfile();
  const { mode, setMode } = useTheme();
  const { prefs, update: updatePref } = useNotificationPrefs();
  const referral = useReferralInfo(userId, profile?.username);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleCopyReferral = async () => {
    if (!referral.data?.code) return;
    try {
      await navigator.clipboard.writeText(referral.data.code);
      setCopied(true);
      toast.success("Invite code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — try again");
    }
  };

  const handleSelectLanguage = async (label: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ primary_language: label, updated_at: new Date().toISOString() })
        .eq("id", userId);
      if (error) throw error;
      invalidateProfile();
      toast.success("Primary language updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update language");
    }
  };

  const handleDownloadData = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      const [{ data: voiceClips }, { data: videoClips }] = await Promise.all([
        supabase.from("voice_clips").select("*").eq("user_id", userId),
        supabase.from("video_clips").select("*").eq("user_id", userId),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        profile: profile ?? null,
        voice_clips: voiceClips ?? [],
        video_clips: videoClips ?? [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lingualink-data-${userId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Your data export has started downloading");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut(() => router.push("/"));
    } catch {
      setSigningOut(false);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader title="Settings" />
      <PageContainer size="sm">
        {/* Account */}
        <SettingsSection title="Account">
          {profileLoading ? (
            <div className="p-4">
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ) : (
            <SettingsItem
              icon={<User className="h-4 w-4" />}
              label="Edit Profile"
              onClick={() => setShowEditProfile(true)}
            />
          )}
          <SettingsItem
            icon={<Lock className="h-4 w-4" />}
            label="Change Password"
            onClick={() => setShowChangePassword(true)}
          />
          <SettingsItem
            icon={<Shield className="h-4 w-4" />}
            label="Privacy Settings"
            value="Coming soon"
            onClick={() => toast("Privacy settings are coming soon!", { icon: "🔒" })}
          />
          <SettingsItem
            icon={<Download className="h-4 w-4" />}
            label="Download My Data"
            onClick={handleDownloadData}
            trailing={exporting ? <Skeleton className="h-4 w-16 rounded" /> : undefined}
          />
          <SettingsItem
            icon={<Award className="h-4 w-4" />}
            label="Ambassador Program"
            onClick={() => router.push("/ambassador")}
          />
        </SettingsSection>

        {/* Referrals */}
        <SettingsSection title="Referrals">
          <SettingsItem
            label="Your invite code"
            value={referral.isLoading ? "Loading…" : referral.data?.code ?? "—"}
            trailing={
              <button
                onClick={handleCopyReferral}
                aria-label="Copy invite code"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)]"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-[var(--success)]" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            }
          />
          <SettingsItem
            label="Your invites"
            value={referral.isLoading ? "Loading…" : `${referral.data?.inviteCount ?? 0} joined`}
            showChevron={false}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <div className="flex gap-1 p-3">
            {(
              [
                { key: "light", label: "Light", icon: Sun },
                { key: "dark", label: "Dark", icon: Moon },
                { key: "system", label: "System", icon: Monitor },
              ] as const
            ).map(({ key, label, icon: Icon }) => {
              const active = mode === key;
              return (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-brand-gradient text-white shadow-glow"
                      : "bg-[var(--input)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </SettingsSection>

        {/* Language */}
        <SettingsSection title="Language">
          <SettingsItem
            icon={<Globe className="h-4 w-4" />}
            label="Primary Language"
            value={profile?.primary_language || "Not set"}
            onClick={() => setShowLanguagePicker(true)}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Heart className="h-4 w-4" />}
            label="Likes on my clips"
            trailing={
              <ToggleSwitch
                label="Likes on my clips"
                checked={prefs.likes}
                onChange={(v) => updatePref("likes", v)}
              />
            }
          />
          <SettingsItem
            icon={<MessageCircleReply className="h-4 w-4" />}
            label="Duet replies"
            trailing={
              <ToggleSwitch
                label="Duet replies"
                checked={prefs.duets}
                onChange={(v) => updatePref("duets", v)}
              />
            }
          />
          <SettingsItem
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Validation requests"
            trailing={
              <ToggleSwitch
                label="Validation requests"
                checked={prefs.validations}
                onChange={(v) => updatePref("validations", v)}
              />
            }
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <SettingsItem
            icon={<Info className="h-4 w-4" />}
            label="Version"
            value={APP_VERSION}
            showChevron={false}
          />
          <SettingsItem
            icon={<FileText className="h-4 w-4" />}
            label="Terms of Service"
            onClick={() => toast("Terms of Service — coming soon!")}
          />
          <SettingsItem
            icon={<FileText className="h-4 w-4" />}
            label="Privacy Policy"
            onClick={() => toast("Privacy Policy — coming soon!")}
          />
          <SettingsItem
            icon={<Mail className="h-4 w-4" />}
            label="Contact Support"
            value={SUPPORT_EMAIL}
            onClick={() => {
              window.location.href = `mailto:${SUPPORT_EMAIL}`;
            }}
          />
        </SettingsSection>

        <PrimaryButton
          variant="danger"
          size="md"
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={handleSignOut}
          loading={signingOut}
          className="mb-8 mt-2"
        >
          Sign Out
        </PrimaryButton>
      </PageContainer>

      {showEditProfile && userId && (
        <EditProfileModal
          userId={userId}
          initialFullName={profile?.full_name ?? ""}
          initialBio={profile?.bio ?? ""}
          onClose={() => setShowEditProfile(false)}
          onSaved={invalidateProfile}
        />
      )}

      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {showLanguagePicker && (
        <LanguageModal
          currentValue={profile?.primary_language ?? null}
          onClose={() => setShowLanguagePicker(false)}
          onSelect={handleSelectLanguage}
        />
      )}
    </div>
  );
}
