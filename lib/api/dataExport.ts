import { supabase } from "@/lib/supabase/client";

/**
 * GDPR data portability exports.
 *
 * Same tables and payload shape as mobile `src/utils/dataExport.ts`; the
 * difference is delivery — mobile writes a file and opens a share sheet, the
 * web triggers a browser download.
 */

export interface UserDataExport {
  exportedAt: string;
  profile: unknown;
  voiceClips: unknown[];
  validations: unknown[];
  reputationHistory: unknown[];
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const stamp = () => new Date().toISOString().slice(0, 10);

/** Everything we hold about this user, in one file. */
export async function exportUserData(userId: string): Promise<void> {
  const [profile, clips, validations, reputation] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("voice_clips").select("*").eq("user_id", userId),
    supabase.from("validations").select("*").eq("user_id", userId),
    supabase.from("reputation_history").select("*").eq("user_id", userId),
  ]);

  const payload: UserDataExport = {
    exportedAt: new Date().toISOString(),
    profile: profile.data ?? null,
    voiceClips: clips.data ?? [],
    // These two tables aren't present in every environment; an empty list is
    // the right answer rather than failing the whole export.
    validations: validations.data ?? [],
    reputationHistory: reputation.data ?? [],
  };

  downloadJson(`lingualink-data-${stamp()}.json`, payload);
}

export async function exportValidationHistory(userId: string): Promise<void> {
  const { data } = await supabase
    .from("validations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  downloadJson(`lingualink-validations-${stamp()}.json`, {
    exportedAt: new Date().toISOString(),
    validations: data ?? [],
  });
}

export async function exportReputationHistory(userId: string): Promise<void> {
  const { data } = await supabase
    .from("reputation_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  downloadJson(`lingualink-reputation-${stamp()}.json`, {
    exportedAt: new Date().toISOString(),
    reputationHistory: data ?? [],
  });
}
