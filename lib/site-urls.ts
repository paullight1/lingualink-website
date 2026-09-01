/**
 * Marketing links stay inside the single deployed Next.js application.
 * Keeping these in one module makes the landing/auth handoff explicit.
 */
export const appUrl = "";
export const adminPortalUrl =
  process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL?.trim().replace(/\/+$/, "") ??
  "https://admin.lingualink.ai/login";
