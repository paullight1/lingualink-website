import { authFetch, parseResponse } from "./authFetch";

/**
 * NestJS /moderation endpoints. The request shape and the reason values below
 * mirror mobile `src/services/moderationApi.ts` exactly — the backend validates
 * `reason` against these constants, so they are not ours to rename.
 */
export const REPORT_REASONS = [
  {
    value: "spam",
    label: "Spam",
    description: "Unwanted promotional content or repetitive posts",
  },
  {
    value: "harassment",
    label: "Harassment",
    description: "Bullying, threats, or targeted abuse",
  },
  {
    value: "inappropriate",
    label: "Inappropriate Content",
    description: "Nudity, violence, or harmful content",
  },
  {
    value: "other",
    label: "Other",
    description: "Something else not listed above",
  },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export const REPORT_STATUS = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
} as const;

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  postId: string | null;
  reason: ReportReason;
  additionalDetails: string | null;
  status: string;
  resolutionAction: string | null;
  resolutionNotes: string | null;
  resolverId: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

/**
 * Report a user, optionally about a specific post. The reporter's identity
 * comes from the validated Clerk JWT on the backend, not from the client.
 */
export async function submitReport(input: {
  reportedUserId: string;
  reason: ReportReason;
  postId?: string;
  additionalDetails?: string;
}): Promise<Report> {
  return parseResponse(
    await authFetch("/moderation/report", {
      method: "POST",
      body: JSON.stringify({
        reportedUserId: input.reportedUserId,
        postId: input.postId,
        reason: input.reason,
        additionalDetails: input.additionalDetails,
      }),
    })
  );
}

export async function getMyReports(): Promise<Report[]> {
  return parseResponse(await authFetch("/moderation/my-reports"));
}

export function getReasonLabel(value: string): string {
  return REPORT_REASONS.find((r) => r.value === value)?.label ?? value;
}
