/**
 * Central react-query key registry. Feature agents import from here so cache
 * keys stay consistent and invalidations line up across the app.
 */
export const qk = {
  profile: (userId: string) => ["profile", userId] as const,
  myProfile: () => ["profile", "me"] as const,
  // Viewer id is part of the key because feed rows carry per-viewer like and
  // follow state — sharing one cache across accounts would leak it.
  feed: (tab: string, viewerId?: string | null) =>
    ["feed", tab, viewerId ?? "anon"] as const,
  stories: () => ["stories"] as const,
  library: (userId: string, tab: string) =>
    ["library", userId, tab] as const,
  savedItems: () => ["saved-items"] as const,
  notifications: () => ["notifications"] as const,
  badges: (userId: string) => ["badges", userId] as const,
  myBadges: () => ["badges", "me"] as const,
  earnings: () => ["earnings"] as const,
  monetizationStatus: () => ["monetization-status"] as const,
  transactions: () => ["transactions"] as const,
  leaderboard: (timeframe: string) => ["leaderboard", timeframe] as const,
  validationQueue: () => ["validation-queue"] as const,
  clip: (clipId: string) => ["clip", clipId] as const,
  nextTask: () => ["next-task"] as const,
  followState: (userId: string) => ["follow-state", userId] as const,
  suggestedUsers: () => ["suggested-users"] as const,
  languages: () => ["languages"] as const,
} as const;
