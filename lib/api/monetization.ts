import { authFetch, parseResponse } from "./authFetch";
import type {
  BankItem,
  BankResolveResult,
  EarningsSummary,
  LinkedBank,
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

  /* Bank / payouts — mirrors mobile's `/bank/*` calls. Each endpoint wraps its
     result in `{ success, data }`, so unwrap `data` here rather than at
     every call site. */
  async getBankList(): Promise<BankItem[]> {
    const res = await parseResponse<{ data: BankItem[] }>(
      await authFetch("/bank/list", { requireAuth: false })
    );
    return res.data ?? [];
  },
  async resolveBank(
    accountNumber: string,
    bankCode: string
  ): Promise<BankResolveResult> {
    const res = await parseResponse<{ data: BankResolveResult }>(
      await authFetch("/bank/resolve", {
        method: "POST",
        body: JSON.stringify({ accountNumber, bankCode }),
      })
    );
    return res.data;
  },
  async linkBank(
    accountNumber: string,
    bankCode: string,
    manualDetails?: { bankName: string; accountName: string }
  ): Promise<{ accountName: string; bankName: string }> {
    const res = await parseResponse<{
      data: { accountName: string; bankName: string };
    }>(
      await authFetch("/bank/link", {
        method: "POST",
        body: JSON.stringify({ accountNumber, bankCode, manualDetails }),
      })
    );
    return res.data;
  },
  async getLinkedBank(): Promise<LinkedBank | null> {
    try {
      const res = await parseResponse<{ data: LinkedBank | null }>(
        await authFetch("/bank/linked")
      );
      return res.data ?? null;
    } catch {
      // No linked account yet is a normal state, not an error to surface.
      return null;
    }
  },
  async unlinkBank(): Promise<void> {
    await authFetch("/bank/unlink", { method: "DELETE" });
  },

  /* Config */
  async getAppConfig<T = unknown>(key: string): Promise<T> {
    return parseResponse(await authFetch(`/config/${key}`, { requireAuth: false }));
  },
};
