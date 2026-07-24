/** Shared helpers for the validation queue + detail pages. */

/**
 * Voice-clip prompts are sometimes stored as meta-phrases like
 * `Create your own version of "Hello"` or `Respond to "How are you?"`.
 * Ported from the mobile ValidationScreen so the raw quoted phrase is
 * shown to validators instead of the wrapper text.
 */
export function extractOriginalPrompt(phrase: string): string {
  if (
    phrase.includes('"Create your own version of "') ||
    phrase.includes('"Respond to "')
  ) {
    const matches = phrase.match(/"([^"]*)"(?: by [^"]*)?$/);
    if (matches && matches[1]) {
      const extracted = matches[1];
      if (
        !extracted.includes('"Create your own version of "') &&
        !extracted.includes('"Respond to "')
      ) {
        return extracted;
      }
      return extractOriginalPrompt(extracted);
    }
  }
  return phrase;
}

export interface FlagReason {
  id: "unclear_audio" | "dialect_dispute" | "inappropriate_content" | "other";
  label: string;
}

export const FLAG_REASONS: FlagReason[] = [
  { id: "unclear_audio", label: "Audio is unclear" },
  { id: "dialect_dispute", label: "Dialect disagreement" },
  { id: "inappropriate_content", label: "Inappropriate content" },
  { id: "other", label: "Other issue" },
];

/** Loose shape of the /monetization/validate + /monetization/flag responses. */
export interface ActionResult {
  success?: boolean;
  message?: string;
  consensusReached?: boolean;
  reward?: number;
}
