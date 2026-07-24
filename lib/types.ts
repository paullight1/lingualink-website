/**
 * Domain types — ported/consolidated from the mobile app's src/types/*
 * and service files. UI-facing shapes plus raw Supabase row shapes.
 */

/* ── Core UI shapes ─────────────────────────────────────────────── */

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  avatarUrl?: string;
  language?: string;
  isFollowing?: boolean;
  followers?: number;
  isVerified?: boolean;
}

export type PostType = "voice" | "video" | "story";

export interface PostContent {
  phrase?: string;
  translation?: string;
  audioUrl?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  storyTitle?: string;
  duration?: number;
  audioWaveform?: number[];
}

export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  validations: number;
  reposts: number;
  duets?: number;
  remixes?: number;
}

export interface PostActions {
  isLiked: boolean;
  isValidated: boolean;
  isReposted: boolean;
  needsValidation: boolean;
}

export interface Post {
  id: string;
  type: PostType;
  user: User;
  content: PostContent;
  engagement: PostEngagement;
  actions: PostActions;
  timeAgo: string;
  createdAt?: string;
  isAIGenerated?: boolean;
  remixInfo?: {
    parentClipId: string;
    parentUsername: string;
    parentAvatarUrl?: string;
  };
}

/* ── Supabase row shapes ────────────────────────────────────────── */

export interface ProfileRow {
  id: string;
  email?: string | null;
  username: string | null;
  full_name: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  primary_language?: string | null;
  interests?: string[] | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  location?: string | null;
  xp?: number | null;
  streak?: number | null;
  balance?: number | null;
  total_earned?: number | null;
  target_followers_count?: number | null;
  has_completed_onboarding?: boolean | null;
  is_verified?: boolean | null;
  is_admin?: boolean | null;
  created_at?: string;
}

export interface VoiceClipRow {
  id: string;
  user_id: string;
  phrase?: string | null;
  translation?: string | null;
  language?: string | null;
  dialect?: string | null;
  audio_url: string;
  duration?: number | null;
  created_at: string;
  likes_count?: number | null;
  comments_count?: number | null;
  validations_count?: number | null;
  is_validated?: boolean | null;
  profiles?: Partial<ProfileRow> | null;
}

export interface VideoClipRow {
  id: string;
  user_id: string;
  phrase?: string | null;
  caption?: string | null;
  translation?: string | null;
  language?: string | null;
  video_url: string;
  thumbnail_url?: string | null;
  duration?: number | null;
  created_at: string;
  likes_count?: number | null;
  comments_count?: number | null;
  profiles?: Partial<ProfileRow> | null;
}

export interface StoryRow {
  id: string;
  user_id: string;
  media_url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  /** Mobile writes the story's text here and falls back to it for display. */
  caption?: string | null;
  content_type?: string | null;
  created_at: string;
  expires_at?: string | null;
  profiles?: Partial<ProfileRow> | null;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title?: string | null;
  message?: string | null;
  is_read: boolean;
  created_at: string;
  data?: {
    actorName?: string;
    actorAvatarUrl?: string;
    actorId?: string;
    [k: string]: unknown;
  } | null;
}

export interface SavedItemRow {
  id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  item_data?: {
    title?: string;
    subtitle?: string;
    image_url?: string;
  } | null;
  created_at: string;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  amount: number;
  type?: string | null;
  description?: string | null;
  created_at: string;
}

/* ── Tasks / prompts ────────────────────────────────────────────── */

export type DifficultyLevel = "basic" | "intermediate" | "advanced" | string;

export interface Campaign {
  id?: string;
  title?: string;
  difficulty_target?: DifficultyLevel;
  reward_per_task?: number;
  currency?: string;
}

export interface Task {
  id: string;
  task_type?: string;
  prompt_data?: { instruction?: string; [k: string]: unknown };
  difficulty?: DifficultyLevel;
  status?: string;
  campaign?: Campaign | null;
}

export interface DailyPrompt {
  id: string;
  language: string;
  phrase: string;
  translation?: string;
  category?: string;
  difficulty?: DifficultyLevel;
}

/* ── Badges ─────────────────────────────────────────────────────── */

export type BadgeCategory = "contributor" | "validator" | "game" | "social";
export type BadgeTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

export interface Badge {
  id: string;
  name: string;
  description?: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon?: string;
}

export interface UserBadge extends Badge {
  earned_at?: string;
  earned?: boolean;
}

export interface BadgeProgress {
  badgeId: string;
  current: number;
  target: number;
}

/* ── Monetization ───────────────────────────────────────────────── */

export interface EarningsSummary {
  balance: number;
  totalEarned: number;
  trustScore?: number;
  validatorTier?: string;
}

export interface MonetizationStatus {
  canMonetize: boolean;
  threshold: number;
  currentFollowers: number;
  followersNeeded: number;
  target_followers_count?: number;
}

export interface ValidationQueueItem {
  id: string;
  phrase: string;
  language: string;
  dialect?: string;
  audio_url: string;
  validations_count: number;
}

export type ValidationQuality = "poor" | "fair" | "good" | "excellent";

/* ── Leaderboard ────────────────────────────────────────────────── */

export interface LeaderboardEntry {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url?: string | null;
  total_earned: number;
  rank: number;
}
