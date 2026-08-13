# LinguaLink Web

The consumer web app for LinguaLink — a voice-data collection + social platform for
underrepresented languages. Built to mirror the mobile app's core experience and reuse the
**same backend** (hosted NestJS API + Supabase + Clerk). No new server required.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Clerk (auth) ·
Supabase (DB/Storage/realtime) · TanStack Query · framer-motion · lucide-react · PostHog.

This is the single deployable LinguaLink application. It serves the public marketing site
(`/`, `/about`, `/blog`, `/faq`, `/contact`, `/privacy`, `/terms`), Clerk auth
(`/sign-up`, `/sign-in`), and the authenticated product (`/feed` and the rest of the app)
from one Next.js deployment.

## Getting started

```bash
cd web-app
npm install
# .env.local is already populated with the same public keys as the mobile app.
# (Copy .env.local.example if you need to recreate it.)
npm run dev        # http://localhost:3000 (landing -> auth -> product)
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

Auth reuses the existing Clerk instance; the browser Supabase client is authenticated with
Clerk's `supabase` JWT template (see `components/providers/SupabaseTokenBridge.tsx`), so
Postgres RLS sees the signed-in user — exactly like the mobile app.

## Structure

```
app/
  (auth)/    sign-in · sign-up · onboarding · profile-setup · interests   (chromeless)
  (app)/     feed · record · tasks · validate/[clipId] · profile · u/[userId]
             library · saved · rewards · leaderboard · store · notifications
             settings · menu   (wrapped in the responsive AppShell)
components/
  ui/        shared kit: GlassCard, PrimaryButton, UserAvatar, AppHeader,
             SegmentedTabs, Chip, WaveformPlayer, StatRow, EmptyState, Settings*
  feed/      FeedPost, StoriesRail, VoiceClipInteractions
  layout/    AppShell (sidebar + bottom nav + Create FAB), CreateSheet, PageContainer
  providers/ Clerk↔Supabase token bridge, Theme (light/dark/system), Query, PostHog
lib/
  supabase/  Clerk-token-injected browser client
  api/       authFetch + badges / monetization / tasks / moderation wrappers
  query/     hooks (useMyProfile, useProfile…), keys, provider
  storage.ts browser uploads to Supabase Storage · types.ts · utils.ts · config.ts
```

## Design system

Ported from the mobile app's `src/constants/Theme.ts` into Tailwind v4 `@theme` tokens +
CSS variables in `app/globals.css`. Brand orange `#FF8A00`, warm-dark glassmorphism, full
light/dark support (toggle in Settings → Appearance; `.dark` class on `<html>`).

## How it was built

A shared foundation (this README's `lib/`, `components/ui`, `components/layout`,
`app/globals.css`, providers) was built first and build-verified, then ~22 parallel agents
each implemented one isolated route against `FOUNDATION.md`. See `FOUNDATION.md` for the
contract every feature follows.

## Status & notes

- ✅ `npm run build` and `npm run typecheck` pass; all 22 routes compile.
- ✅ Public routes render; protected routes are gated by Clerk middleware.
- ⚠️ Deferred (per scope): LiveKit calls/live-streaming, games (WordChain/TurnVerse),
  chat/DMs, deep withdrawals/payout & admin. The feed's "Live" tab and some actions show
  "coming soon" placeholders.
- ⚠️ Data-layer behavior (reads/writes against real Supabase tables) should be spot-checked
  while signed in — a few queries assume column names inferred from the mobile app
  (e.g. `referral_codes`, `followers` unique constraint); adjust if your schema differs.
```
