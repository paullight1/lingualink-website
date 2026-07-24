import { Gift, Globe2, Mic, Sparkles, type LucideIcon } from "lucide-react";

/** localStorage flag written once the user finishes or skips the carousel. */
export const ONBOARDING_STORAGE_KEY = "lingualink-seen-onboarding";

export interface OnboardingSlide {
  icon: LucideIcon;
  title: string;
  /** word within `title` to render in the brand-orange gradient */
  highlight: string;
  body: string;
  /** category accent hex used for the glowing icon circle (per FOUNDATION.md accents) */
  accent: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    icon: Mic,
    title: "Share Your Voice",
    highlight: "Voice",
    body: "Record phrases and stories in your native language. Every clip you share helps preserve a language for future generations.",
    accent: "#3B82F6",
  },
  {
    icon: Sparkles,
    title: "Create AI Stories",
    highlight: "Stories",
    body: "Turn your recordings into AI-narrated stories and short videos that bring your culture and language to life.",
    accent: "#8B5CF6",
  },
  {
    icon: Globe2,
    title: "Preserve Culture",
    highlight: "Culture",
    body: "Join a global community safeguarding endangered languages, dialects, and traditions — one word at a time.",
    accent: "#10B981",
  },
  {
    icon: Gift,
    title: "Earn & Learn",
    highlight: "Earn",
    body: "Complete daily tasks, validate recordings from others, and grow your streak to earn real rewards while you learn.",
    accent: "#F59E0B",
  },
];
