import { supabase } from "@/lib/supabase/client";
import { BUCKETS, SUPABASE_URL } from "@/lib/config";
import { getSupabaseToken } from "@/lib/supabase/client";
import { extensionForMime } from "@/lib/media";

/**
 * Chat data layer — DMs and group conversations.
 *
 * Ported from mobile `src/services/chatService.ts` + `src/hooks/useChat.ts`.
 * Everything here targets the same tables (`conversations`,
 * `conversation_members`, `messages`) and the same SECURITY DEFINER RPCs
 * (`create_or_get_dm`, `get_conversations_with_unread`,
 * `get_other_participant`) the Expo app uses, so a thread is identical from
 * either client.
 */

export interface ConversationSummary {
  id: string;
  title: string | null;
  created_by: string;
  is_group: boolean;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  unread_count: number;
}

export interface ChatParticipant {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  primary_language: string | null;
}

export type MessageType = "text" | "voice" | "image";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string | null;
  type: MessageType;
  media_url: string | null;
  created_at: string;
}

export interface GroupConversation {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  language: string | null;
  is_private: boolean | null;
  is_group: boolean;
  created_by: string;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  member_count?: number;
  is_member?: boolean;
}

/* ── Conversations ──────────────────────────────────────────────── */

/** All of the viewer's conversations with unread counts, most recent first. */
export async function getConversations(): Promise<ConversationSummary[]> {
  const { data, error } = await supabase.rpc("get_conversations_with_unread");
  if (error) {
    console.error("[chat] conversations fetch failed", error);
    return [];
  }
  return ((data as ConversationSummary[] | null) ?? []).map((c) => ({
    ...c,
    unread_count: Number(c.unread_count ?? 0),
  }));
}

/**
 * The other person in a DM. The RPC returns a `profiles` row shaped result;
 * older mobile typings called the key `user_id`, so both are tolerated.
 */
export async function getOtherParticipant(
  conversationId: string
): Promise<ChatParticipant | null> {
  const { data, error } = await supabase.rpc("get_other_participant", {
    p_conversation_id: conversationId,
  });
  if (error) {
    console.error("[chat] participant fetch failed", error);
    return null;
  }
  const row = (data as (ChatParticipant & { user_id?: string })[] | null)?.[0];
  if (!row) return null;
  return { ...row, id: row.id ?? row.user_id ?? "" };
}

/** Create (or reuse) the DM between the viewer and `targetUserId`. */
export async function createOrGetDm(targetUserId: string): Promise<string> {
  const { data, error } = await supabase.rpc("create_or_get_dm", {
    target: targetUserId,
  });
  if (error) throw error;
  return data as string;
}

export async function getConversation(
  conversationId: string
): Promise<GroupConversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();
  if (error) {
    console.error("[chat] conversation fetch failed", error);
    return null;
  }
  return (data as GroupConversation) ?? null;
}

/** Advance the viewer's read cursor — drives `unread_count` in the list RPC. */
export async function markConversationRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    await supabase
      .from("conversation_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", userId);
  } catch {
    // Non-critical — a stale unread badge is better than a failed thread open.
  }
}

/* ── Messages ───────────────────────────────────────────────────── */

export async function getMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[chat] messages fetch failed", error);
    return [];
  }
  return (data as ChatMessage[] | null) ?? [];
}

export async function sendTextMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text: text.trim(),
      type: "text",
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

/**
 * Upload a recorded voice note and post it as a `voice` message.
 * Storage path mirrors mobile: `voice-messages/voice-{userId}-{ts}.{ext}`.
 */
export async function sendVoiceMessage(
  conversationId: string,
  senderId: string,
  blob: Blob
): Promise<ChatMessage> {
  const contentType = blob.type || "audio/mp4";
  const ext = extensionForMime(contentType);
  const path = `voice-messages/voice-${senderId}-${Date.now()}.${ext}`;

  const token = await getSupabaseToken();
  if (token) {
    // Direct REST with the Clerk JWT, same as the other uploads in this app.
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKETS.voiceMessages}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": contentType,
          "cache-control": "3600",
        },
        body: blob,
      }
    );
    if (!res.ok) {
      throw new Error(`Voice message upload failed (${res.status})`);
    }
  } else {
    const { error } = await supabase.storage
      .from(BUCKETS.voiceMessages)
      .upload(path, blob, { contentType, cacheControl: "3600" });
    if (error) throw error;
  }

  const { data: pub } = supabase.storage
    .from(BUCKETS.voiceMessages)
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      type: "voice",
      media_url: pub.publicUrl,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ChatMessage;
}

/* ── Contacts ───────────────────────────────────────────────────── */

/**
 * People the viewer can start a DM with: mutual follows first.
 * Mobile calls a `get_mutual_follows` RPC; it isn't present in every
 * environment, so this computes the intersection client-side instead — same
 * result from the same `followers` table, without depending on the function.
 */
export async function getMutualFollows(
  userId: string
): Promise<ChatParticipant[]> {
  const [followingRes, followersRes] = await Promise.all([
    supabase.from("followers").select("following_id").eq("follower_id", userId),
    supabase.from("followers").select("follower_id").eq("following_id", userId),
  ]);

  if (followingRes.error || followersRes.error) {
    console.error(
      "[chat] mutual follows lookup failed",
      followingRes.error ?? followersRes.error
    );
    return [];
  }

  const following = new Set(
    ((followingRes.data as { following_id: string }[] | null) ?? []).map(
      (r) => r.following_id
    )
  );
  const mutualIds = (
    (followersRes.data as { follower_id: string }[] | null) ?? []
  )
    .map((r) => r.follower_id)
    .filter((id) => following.has(id));

  return getProfiles(mutualIds);
}

export async function getProfiles(
  userIds: string[]
): Promise<ChatParticipant[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, primary_language, avatar_url")
    .in("id", userIds);
  if (error) {
    console.error("[chat] profiles fetch failed", error);
    return [];
  }
  return (data as ChatParticipant[] | null) ?? [];
}

/** Free-text people search for starting a new conversation. */
export async function searchPeople(
  query: string,
  excludeUserId: string,
  limit = 20
): Promise<ChatParticipant[]> {
  const term = query.trim();
  if (!term) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, primary_language, avatar_url")
    .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
    .neq("id", excludeUserId)
    .limit(limit);

  if (error) {
    console.error("[chat] people search failed", error);
    return [];
  }
  return (data as ChatParticipant[] | null) ?? [];
}

/* ── Groups ─────────────────────────────────────────────────────── */

export async function getJoinedGroups(
  userId: string
): Promise<GroupConversation[]> {
  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id, conversations(*)")
    .eq("user_id", userId);

  if (error) {
    console.error("[chat] joined groups fetch failed", error);
    return [];
  }

  // PostgREST types an embedded one-to-one join as an array, so normalize
  // whichever shape comes back before filtering to groups.
  const rows =
    (data as unknown as {
      conversations: GroupConversation | GroupConversation[] | null;
    }[] | null) ?? [];

  return rows
    .map((r) =>
      Array.isArray(r.conversations) ? r.conversations[0] : r.conversations
    )
    .filter((c): c is GroupConversation => !!c && c.is_group === true)
    .map((c) => ({ ...c, is_member: true }));
}

/** Public groups available to join, newest first. */
export async function discoverGroups(limit = 50): Promise<GroupConversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("is_group", true)
    .or("is_private.is.null,is_private.eq.false")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[chat] group discovery failed", error);
    return [];
  }
  return (data as GroupConversation[] | null) ?? [];
}

export async function getGroupMemberCount(groupId: string): Promise<number> {
  const { count } = await supabase
    .from("conversation_members")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", groupId);
  return count ?? 0;
}

export async function getGroupMembers(
  groupId: string
): Promise<(ChatParticipant & { role: string })[]> {
  const { data, error } = await supabase
    .from("conversation_members")
    .select("user_id, role")
    .eq("conversation_id", groupId);

  if (error) {
    console.error("[chat] group members fetch failed", error);
    return [];
  }

  const rows = (data as { user_id: string; role: string }[] | null) ?? [];
  const profiles = await getProfiles(rows.map((r) => r.user_id));
  const roleById = new Map(rows.map((r) => [r.user_id, r.role]));
  return profiles.map((p) => ({ ...p, role: roleById.get(p.id) ?? "member" }));
}

export async function createGroup(input: {
  userId: string;
  title: string;
  description?: string;
  category?: string;
  language?: string;
  isPrivate?: boolean;
}): Promise<GroupConversation> {
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      title: input.title,
      is_group: true,
      created_by: input.userId,
      description: input.description || null,
      category: input.category || null,
      language: input.language || null,
      is_private: input.isPrivate ?? false,
    })
    .select()
    .single();
  if (error) throw error;

  // The creator joins as admin, matching the mobile CreateGroupModal flow.
  const { error: memberError } = await supabase
    .from("conversation_members")
    .insert({
      conversation_id: conversation.id,
      user_id: input.userId,
      role: "admin",
    });
  if (memberError) throw memberError;

  return conversation as GroupConversation;
}

export async function joinGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.from("conversation_members").insert({
    conversation_id: groupId,
    user_id: userId,
    role: "member",
  });
  // A duplicate join is not an error worth surfacing.
  if (error && error.code !== "23505") throw error;
}

export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("conversation_members")
    .delete()
    .eq("conversation_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}
