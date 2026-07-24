import { authFetch, parseResponse } from "./authFetch";

/** NestJS /moderation endpoints. Mirrors mobile src/services/moderationApi.ts. */
export const REPORT_REASONS = [
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
] as const;

export interface Report {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export async function submitReport(input: {
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
}): Promise<Report> {
  return parseResponse(
    await authFetch("/moderation/report", {
      method: "POST",
      body: JSON.stringify(input),
    })
  );
}

export async function getMyReports(): Promise<Report[]> {
  return parseResponse(await authFetch("/moderation/my-reports"));
}

export function getReasonLabel(value: string): string {
  return REPORT_REASONS.find((r) => r.value === value)?.label ?? value;
}
