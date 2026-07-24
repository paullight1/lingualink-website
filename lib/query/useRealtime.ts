"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export interface TableSubscription {
  table: string;
  event?: RealtimeEvent;
  /** Postgres filter, e.g. `user_id=eq.abc`. */
  filter?: string;
}

/**
 * Subscribe to `postgres_changes` on one or more tables and run `onChange`
 * whenever a matching row event arrives. Ports the mobile app's realtime
 * channels (e.g. ModernHomeScreen's `global_feed`) so both clients react to
 * writes from the other in the same way.
 *
 * `onChange` is held in a ref, so passing an inline callback does not tear the
 * channel down and rebuild it on every render.
 */
export function useRealtime(
  channelName: string,
  subscriptions: TableSubscription[],
  onChange: () => void,
  enabled = true
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Serialized so an inline array literal doesn't resubscribe every render.
  const key = JSON.stringify(subscriptions);

  useEffect(() => {
    if (!enabled) return;

    const subs: TableSubscription[] = JSON.parse(key);
    let channel: RealtimeChannel = supabase.channel(channelName);

    for (const sub of subs) {
      channel = channel.on(
        // supabase-js types this listener as a literal union; the cast keeps
        // the helper generic over table names without widening the payload.
        "postgres_changes" as never,
        {
          event: sub.event ?? "*",
          schema: "public",
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        } as never,
        () => onChangeRef.current()
      );
    }

    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, key, enabled]);
}
