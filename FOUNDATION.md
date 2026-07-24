# LinguaLink Web — Foundation Contract (read before building any feature)

This is the shared foundation every feature agent builds on. **Read this fully, then
build ONLY your assigned route.** The project already builds (`npx next build` passes).

## Golden rules (do not break the build for others)

1. **Own only your assigned file(s).** Do NOT edit shared foundation files:
   `app/layout.tsx`, `app/globals.css`, `middleware.ts`, `package.json`,
   `components/ui/*`, `components/layout/*`, `components/providers/*`, `lib/*`.
   If you think one needs a change, add a NEW colocated file in your own folder
   instead, or leave a `// TODO(foundation):` note in your page — do not modify shared files.
2. **Use only already-installed dependencies** (see `package.json`). Do NOT add packages.
   Available: `@clerk/nextjs`, `@supabase/supabase-js`, `@tanstack/react-query`,
   `framer-motion`, `lucide-react`, `react-hot-toast`, `clsx`, `tailwind-merge`, `date-fns`,
   `posthog-js`, Next 16 / React 19.
3. **Clean code:** TypeScript strict (no `any` unless unavoidable), small components,
   colocate feature-only components/hooks inside your route folder. Match the style of the
   existing UI-kit files. Add brief comments only where intent isn't obvious.
4. **Responsive + theme-aware.** Must look right on mobile (≤400px) and desktop, in BOTH
   dark and light themes. Only use the CSS-variable colors below — never hardcode a hex that
   won't adapt to theme (brand orange `#FF8A00` is fine; neutral grays must use vars).
5. **Client vs server:** pages that use hooks/interactivity need `"use client"`. Data
   fetching is client-side via React Query + the Supabase client (Clerk owns the token).
6. Keep imports pointing at `@/...` (path alias → project root).

## Stack & layout

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · Clerk · Supabase · React Query.
Path alias: `@/*` → repo root of `web-app/`.

- Auth/onboarding pages live under `app/(auth)/...` (chromeless, centered).
- Authenticated pages live under `app/(app)/...` (wrapped in the responsive AppShell:
  desktop sidebar + mobile bottom nav + Create FAB). Your page renders INSIDE that shell —
  do not add your own global nav. For sub-page chrome, use `<AppHeader>`.

## Design tokens (Tailwind v4 + CSS vars) — from mobile `src/constants/Theme.ts`

Theme-aware via `.dark` class on `<html>`. Use these tokens:

- Brand orange: `text-[var(--color-primary)]`, gradient util `bg-brand-gradient` /
  `text-brand-gradient`, glow util `shadow-glow`. Primary gradient = `#FF8A00→#FF5F00`.
- Surfaces: `bg-[var(--background)]`, `bg-[var(--surface)]`, `bg-[var(--card)]`,
  `bg-[var(--input)]`. Text: `text-[var(--foreground)]`, `text-[var(--muted)]`.
  Borders: `border-[var(--border-light)]`. Status: `--success`, `--error`, `--warning`.
  Category accents: purple `#8B5CF6` (AI/video), blue `#3B82F6`, green `#10B981`, amber `#F59E0B`.
- Glass surface: use the `<GlassCard>` component (or the `.glass` utility). Radius scale:
  `rounded-[16px]` cards, `rounded-[24px]` glass, buttons are pill (`rounded-full`, ~h-14).
- Font = system default (already set on body). Headings bold/extrabold, tight tracking.
- Vibe: premium, vibrant, cultural, glassmorphism, soft orange glows, subtle motion.

## Shared UI kit — `import { X } from "@/components/ui"`

- `GlassCard` — translucent blurred card. Props: `intensity?`, `borderColor?`, `className`.
- `PrimaryButton` — pill CTA. Props: `variant?('primary'|'secondary'|'outline'|'ghost'|'danger')`,
  `size?('sm'|'md'|'lg')`, `loading?`, `fullWidth?`(default true), `leftIcon?`, `rightIcon?`.
- `UserAvatar` — `{ uri?, size?, name?, ring? }` (initials/icon fallback).
- `AppHeader` — sticky sub-page header `{ title, showBack?, onBack?, rightElement? }`.
- `SegmentedTabs` — `{ tabs:[{key,label,icon?}], value, onChange, variant?('underline'|'pill') }`.
- `Chip` — selectable pill `{ label, selected?, onClick, icon?, showCheck?, color? }`.
- `WaveformPlayer` — audio player w/ play button + waveform `{ src, waveform?, duration?, seed?, compact? }`.
- `StatRow` — `{ stats:[{label,value,onClick?}] }`.
- `EmptyState` — `{ icon?, title, message?, action? }`.
- `Skeleton`, `Spinner` — loading placeholders.
- `SettingsSection` / `SettingsItem` — grouped settings rows.
- Layout helper: `import { PageContainer } from "@/components/layout/PageContainer"` — page padding/max-width.

## Data layer

- **Supabase** (DB/Storage/realtime): `import { supabase } from "@/lib/supabase/client"`.
  Clerk JWT is auto-injected → RLS sees the user. Storage: `import { uploadAudio, uploadVideo,
  uploadAvatar, publicUrl } from "@/lib/storage"`.
- **NestJS REST** wrappers: `import { badgesApi } from "@/lib/api/badges"`,
  `{ monetizationApi } from "@/lib/api/monetization"`, `{ taskService } from "@/lib/api/tasks"`,
  `{ submitReport } from "@/lib/api/moderation"`. Raw calls: `authFetch`, `parseResponse` from
  `@/lib/api/authFetch`.
- **Identity + profile hooks:** `import { useCurrentUserId, useMyProfile, useProfile,
  useInvalidateMyProfile } from "@/lib/query/hooks"`.
- **Query keys:** `import { qk } from "@/lib/query/keys"` — use these so caches align. Add new
  keys there ONLY if truly needed (prefer colocated inline keys otherwise to avoid touching shared files;
  if you must, append — never rename existing keys).
- **Types:** `import type { ... } from "@/lib/types"` (Post, ProfileRow, VoiceClipRow,
  VideoClipRow, StoryRow, NotificationRow, SavedItemRow, TransactionRow, Task, Badge,
  EarningsSummary, MonetizationStatus, ValidationQueueItem, LeaderboardEntry, etc.).
- **Utils:** `import { cn, timeAgo, initials, formatUsd, formatDuration, normalizeUsername,
  fallbackWaveform } from "@/lib/utils"`.
- **Analytics:** `import { analytics } from "@/components/providers/PostHogProvider"` — `analytics.track(event, props)`.

### Supabase tables (in-scope)
`profiles, voice_clips, video_clips, stories, story_views, followers, follower_counts (view),
likes, comments, validations, voice_clip_validation_stats, saved_items, notifications, tasks,
campaigns, daily_prompts, transactions, referral_codes, referrals, languages`.
Storage buckets: `voice-clips, videos, stories, avatars`.

Key column notes: `profiles(id, username, full_name, bio, avatar_url, primary_language,
interests[], country, state, city, xp, streak, balance, total_earned, target_followers_count,
has_completed_onboarding, is_verified)`. Clips join `profiles` via `user_id`. `voice_clips` has
`phrase, translation, language, dialect, audio_url, duration, likes_count, comments_count,
validations_count, is_validated`. Always filter user content by `user_id`.

## Porting source (React Native → web)

The mobile app is at `../orginal lingualink/src`. Your brief names the exact screen file to
port from (e.g. `src/screens/RewardsScreen.tsx`). Port the **layout, data calls, and behavior** —
NOT React Native primitives. Translate: `View→div`, `Text→span/p`, `TouchableOpacity→button`,
`FlatList→map`, `StyleSheet→Tailwind classes`, `expo-av/expo-audio→<audio>/MediaRecorder`,
`expo-camera→getUserMedia`, `AsyncStorage→localStorage`, navigation → `next/link` + `useRouter`.
Reuse the mobile data queries against the SAME Supabase tables. Country/language lists to port
if needed: `../orginal lingualink/src/constants/CountryData.ts`.

## Definition of done (per agent)

- Your route renders real data (or a clean empty/loading/error state) and is fully responsive
  in dark + light. No console errors on the happy path. No hardcoded non-theme colors.
- Only your assigned files were created/edited. `npx tsc --noEmit` would pass for your files
  (no new type errors). Leave a one-line comment at the top of your page naming what you built.
