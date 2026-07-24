/** Local types for the home feed route (not shared/global — colocated on purpose). */

export type FeedTab = "feed" | "trending" | "live";

/** `live_streams` isn't in the FOUNDATION table list yet, so this is a best-effort
 *  shape based on the mobile app's liveService; queries fail soft if it's missing. */
export interface LiveStreamRow {
  id: string;
  user_id: string;
  title?: string | null;
  is_live: boolean;
  viewer_count?: number | null;
  created_at: string;
  profiles?: {
    id?: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
}
