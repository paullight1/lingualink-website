import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/**
 * Vars that must exist *at build time*. The `NEXT_PUBLIC_` ones are inlined
 * into the client bundle by the compiler, so a missing value can't be repaired
 * later by setting it at runtime — the bundle ships with `undefined` baked in.
 *
 * Without this check the first symptom is Clerk throwing "Missing
 * publishableKey" from inside a prerendered page, which names neither the
 * variable nor the environment that failed to supply it.
 */
const REQUIRED_AT_BUILD = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_API_URL",
  "CLERK_SECRET_KEY",
] as const;

/** Reports which required vars the build can actually see. Never logs values. */
function auditBuildEnv() {
  const missing = REQUIRED_AT_BUILD.filter((k) => !process.env[k]);

  // The decisive diagnostic when a var "was added" but isn't arriving: if this
  // list is empty the build got no public config at all (wrong Vercel project,
  // or wrong environment/branch scope); if it's non-empty but the expected name
  // is absent, the name itself is wrong.
  const visible = Object.keys(process.env)
    .filter((k) => k.startsWith("NEXT_PUBLIC_"))
    .sort();

  console.log("\n[env-audit] NEXT_PUBLIC_* visible to this build:");
  console.log(visible.length ? visible.map((k) => `  - ${k}`).join("\n") : "  (none)");
  console.log(
    `[env-audit] CLERK_SECRET_KEY: ${process.env.CLERK_SECRET_KEY ? "present" : "MISSING"}\n`
  );

  if (missing.length) {
    throw new Error(
      `Missing required build-time environment variables:\n` +
        missing.map((k) => `  - ${k}`).join("\n") +
        `\n\nOn Vercel these must be set for the environment being deployed ` +
        `(a push to main builds Production, not Preview), on the project this ` +
        `repo is linked to. Re-check names exactly — the NEXT_PUBLIC_ prefix ` +
        `is what makes a value reach the browser bundle.`
    );
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "yeaurbjtntkwbbqwjutm.supabase.co" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "thumbs.dreamstime.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
    ],
  },
};

export default (phase: string): NextConfig => {
  if (phase === PHASE_PRODUCTION_BUILD) auditBuildEnv();
  return nextConfig;
};
