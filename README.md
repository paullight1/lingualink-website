# LinguaLink Marketing Website

Public marketing site for the LinguaLink app: landing page, about, blog, FAQ,
contact and legal pages. Lives alongside (but independent of) `../web-app`,
the authenticated consumer web app.

## Stack

- Next.js 16 (App Router, all pages statically prerendered)
- React 19, TypeScript strict
- Tailwind CSS v4 (design tokens in `app/globals.css` via `@theme`)
- Phosphor icons, Bricolage Grotesque via `next/font`

## Run it

```bash
npm install
npm run dev      # http://localhost:3100
npm run build    # production build (static)
npm start        # serve the production build on :3100
```

## Where things live

- `app/` routes: `/` `/about` `/blog` `/blog/[slug]` `/faq` `/contact` `/privacy` `/terms`
- `components/site/` shared chrome: Nav, Footer, Logo, Reveal, DarkCta, StoreButtons
- `lib/posts.ts` blog content (plain data, no CMS; add a post by appending here)
- `public/images/` photography (free Unsplash photos, see `credits.json` for
  photographer credits and source links)

## Design system notes

- Palette: white base, one brand accent (`#FF8A00 → #FF5F00`), warm near-black
  ink, subtle orange-tinted section shade (`--color-tint`), one dark band
  (`--color-night`) per page for the download CTA.
- Radius rule: cards 16px (`rounded-card`), interactive elements are pills.
- Motion: CSS-only. Hero uses `.rise` entrance; below-the-fold sections use
  `.reveal` (scroll-driven animation, `@supports`-gated, visible-by-default,
  honors `prefers-reduced-motion`).
- Copy is written to roughly a grade-5 reading level on purpose.
- Store links in `components/site/StoreButtons.tsx` are placeholders; point
  them at the real listings when live.
