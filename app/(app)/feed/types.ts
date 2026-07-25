/** Local types for the home feed route (not shared/global — colocated on purpose). */

export type FeedTab = "feed" | "trending" | "live";

/* Live streams are read through `/live/discover` (see `lib/api/live.ts`), which
   is also what the mobile app uses, so the feed no longer models the
   `live_streams` table directly. Note if you ever query it: the owner column is
   `streamer_id`, not `user_id`. */
