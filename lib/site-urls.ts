const productionAppUrl = "https://lingualink-website.vercel.app";
const localAppUrl = "http://localhost:3000";

function isLocalUrl(value: string) {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(value);
}

function resolveUrl(value: string | undefined, productionFallback: string) {
  const configuredUrl = value?.trim().replace(/\/+$/, "");

  if (configuredUrl && !isLocalUrl(configuredUrl)) {
    return configuredUrl;
  }

  return process.env.NODE_ENV === "development" ? localAppUrl : productionFallback;
}

export const appUrl = resolveUrl(process.env.NEXT_PUBLIC_WEB_APP_URL, productionAppUrl);
export const adminPortalUrl =
  process.env.NEXT_PUBLIC_ADMIN_PORTAL_URL?.trim().replace(/\/+$/, "") ??
  "http://localhost:3000/login";
