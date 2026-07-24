import { authFetch, parseResponse } from "./authFetch";
import type { Badge, UserBadge, BadgeProgress } from "@/lib/types";

/** NestJS /badges endpoints. Mirrors mobile src/services/badgesApi.ts. */
export const badgesApi = {
  async getAllBadges(): Promise<Badge[]> {
    return parseResponse(await authFetch("/badges", { requireAuth: false }));
  },
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return parseResponse(
      await authFetch(`/badges/user/${userId}`, { requireAuth: false })
    );
  },
  async getMyBadges(): Promise<UserBadge[]> {
    return parseResponse(await authFetch("/badges/me"));
  },
  async getMyBadgeProgress(): Promise<BadgeProgress[]> {
    return parseResponse(await authFetch("/badges/me/progress"));
  },
  async getCertificate(badgeId: string): Promise<{ url?: string } & Record<string, unknown>> {
    return parseResponse(await authFetch(`/badges/${badgeId}/certificate`));
  },
};
