import { authFetch, parseResponse } from "./authFetch";
import type {
  EarningsSummary,
  MonetizationStatus,
  ValidationQueueItem,
  ValidationQuality,
} from "@/lib/types";

/** NestJS /monetization, /payments, /withdrawals, /bank, /config endpoints.
 *  Mirrors mobile src/services/monetizationApi.ts (in-scope subset). */
export const monetizationApi = {
  /* Validation */
  async submitValidation(
    voiceClipId: string,
    isApproved: boolean,
    feedback?: string,
    quality?: ValidationQuality
  ) {
    return parseResponse(
      await authFetch("/monetization/validate", {
        method: "POST",
        body: JSON.stringify({ voiceClipId, isApproved, feedback, quality }),
      })
    );
  },
  async flagForReview(voiceClipId: string, reason: string, details?: string) {
    return parseResponse(
      await authFetch("/monetization/flag", {
        method: "POST",
        body: JSON.stringify({ voiceClipId, reason, details }),
      })
    );
  },
  async getValidationQueue(limit = 20): Promise<ValidationQueueItem[]> {
    return parseResponse(
      await authFetch(`/monetization/queue?limit=${limit}`)
    );
  },
  async getValidationHistory(limit = 20) {
    return parseResponse(
      await authFetch(`/monetization/history?limit=${limit}`)
    );
  },

  /* Earnings / status */
  async getEarningsSummary(): Promise<EarningsSummary> {
    return parseResponse(await authFetch("/monetization/earnings"));
  },
  async getMonetizationStatus(): Promise<MonetizationStatus> {
    return parseResponse(await authFetch("/monetization/threshold/status"));
  },

  /* Payments / withdrawals */
  async initializeTopUp(amount: number, email: string) {
    return parseResponse(
      await authFetch("/payments/top-up", {
        method: "POST",
        body: JSON.stringify({ amount, email }),
      })
    );
  },
  async getBalanceSummary() {
    return parseResponse(await authFetch("/withdrawals/balance"));
  },
  async requestWithdrawal(amount: number, meta?: Record<string, unknown>) {
    return parseResponse(
      await authFetch("/withdrawals", {
        method: "POST",
        body: JSON.stringify({ amount, ...meta }),
      })
    );
  },
  async getWithdrawals(limit = 20) {
    return parseResponse(await authFetch(`/withdrawals?limit=${limit}`));
  },

  /* Config */
  async getAppConfig<T = unknown>(key: string): Promise<T> {
    return parseResponse(await authFetch(`/config/${key}`, { requireAuth: false }));
  },
};
