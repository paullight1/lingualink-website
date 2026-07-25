import { authFetch } from "./authFetch";
import { supabase } from "@/lib/supabase/client";

/**
 * Duets / remixes.
 *
 * Publishing goes through the backend's `POST /monetization/remix`, exactly as
 * mobile's `uploadDuet` does — the server owns creating the child clip, linking
 * `parent_clip_id`, and splitting royalties, so the web app must not insert the
 * row itself.
 */

export type DuetType = "response" | "correction" | "explanation" | "translation";

export interface DuetOption {
  type: DuetType;
  title: string;
  description: string;
  color: string;
}

/** Same four modes, copy and colors as the mobile DuetTypeSelector. */
export const DUET_OPTIONS: DuetOption[] = [
  {
    type: "response",
    title: "Response Duet",
    description: "Reply naturally to continue the conversation",
    color: "#3B82F6",
  },
  {
    type: "correction",
    title: "Correction Duet",
    description: "Point out errors and provide the correct version",
    color: "#EF4444",
  },
  {
    type: "explanation",
    title: "Explanation Duet",
    description: "Explain what this means in your language",
    color: "#10B981",
  },
  {
    type: "translation",
    title: "Translation Duet",
    description: "Translate this to another language",
    color: "#A855F7",
  },
];

export async function createRemix(input: {
  parentClipId: string;
  parentClipPhrase: string;
  language: string;
  dialect?: string | null;
  audioUrl: string;
  duetType: DuetType;
}): Promise<void> {
  const response = await authFetch("/monetization/remix", {
    method: "POST",
    body: JSON.stringify({
      parentClipId: input.parentClipId,
      // Phrase format matches mobile so remixes read the same in both feeds.
      phrase: `Remix of "${input.parentClipPhrase || "clip"}"`,
      language: input.language,
      dialect: input.dialect ?? undefined,
      audioUrl: input.audioUrl,
      duetType: input.duetType,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || "Failed to publish duet");
  }
}

export interface RemixEvent {
  id: string;
  created_at: string;
  remixer: { username: string; avatar_url: string | null };
  original_clip: { phrase: string };
}

/**
 * Remixes other people made of *your* clips.
 *
 * Two schema facts drive the shape of this, both verified against the live DB:
 *  - the parent link column is `original_clip_id` (there is no
 *    `parent_clip_id`, despite what the older schema SQL suggests), and
 *  - `voice_clips` has more than one self-referencing FK, so PostgREST refuses
 *    to embed the parent clip ("more than one relationship was found").
 *
 * So the parent phrases are resolved with a second keyed query instead of a
 * join. Your own clip ids are fetched first because the filter has to run on
 * the child side of the relationship.
 */
export async function getRemixesOfMyClips(
  userId: string
): Promise<RemixEvent[]> {
  const { data: myClips, error: clipsError } = await supabase
    .from("voice_clips")
    .select("id")
    .eq("user_id", userId);

  if (clipsError) {
    console.error("[duets] own clips lookup failed", clipsError);
    return [];
  }

  const myClipIds = ((myClips as { id: string }[] | null) ?? []).map((c) => c.id);
  if (myClipIds.length === 0) return [];

  const { data, error } = await supabase
    .from("voice_clips")
    .select(
      "id, created_at, phrase, original_clip_id, user:profiles!voice_clips_user_id_fkey(username, avatar_url)"
    )
    .in("original_clip_id", myClipIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[duets] remix history fetch failed", error);
    return [];
  }

  type RemixRow = {
    id: string;
    created_at: string;
    original_clip_id: string | null;
    user: { username: string | null; avatar_url: string | null } | null;
  };

  const rows = (data as unknown as RemixRow[]) ?? [];
  if (rows.length === 0) return [];

  // Resolve the parent clips' phrases in one keyed lookup.
  const parentIds = [
    ...new Set(rows.map((r) => r.original_clip_id).filter((id): id is string => !!id)),
  ];
  const phraseById = new Map<string, string>();
  if (parentIds.length > 0) {
    const { data: parents } = await supabase
      .from("voice_clips")
      .select("id, phrase")
      .in("id", parentIds);
    for (const parent of (parents as { id: string; phrase: string | null }[] | null) ?? []) {
      phraseById.set(parent.id, parent.phrase ?? "");
    }
  }

  return rows.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    remixer: {
      username: r.user?.username || "Unknown",
      avatar_url: r.user?.avatar_url ?? null,
    },
    original_clip: {
      phrase:
        (r.original_clip_id && phraseById.get(r.original_clip_id)) || "Deleted clip",
    },
  }));
}
