"use client";

/** Owner: Agent 15 — Saved Items: list, unsave (optimistic), clear all. */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { AppHeader, EmptyState, GlassCard, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId } from "@/lib/query/hooks";
import { qk } from "@/lib/query/keys";
import { supabase } from "@/lib/supabase/client";
import { cn, timeAgo } from "@/lib/utils";
import type { SavedItemRow } from "@/lib/types";
import { ConfirmDialog } from "./ConfirmDialog";

async function fetchSavedItems(userId: string): Promise<SavedItemRow[]> {
  const { data, error } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as SavedItemRow[]) ?? [];
}

function formatType(itemType: string): string {
  return itemType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function SavedPage() {
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const { data: savedItems, isLoading } = useQuery({
    queryKey: qk.savedItems(),
    enabled: !!userId,
    queryFn: () => fetchSavedItems(userId as string),
  });

  const unsaveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_items").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: qk.savedItems() });
      const previous = queryClient.getQueryData<SavedItemRow[]>(qk.savedItems());
      queryClient.setQueryData<SavedItemRow[]>(qk.savedItems(), (prev) =>
        (prev ?? []).filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.savedItems(), context.previous);
      }
      toast.error("Failed to remove item.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.savedItems() });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: qk.savedItems() });
      const previous = queryClient.getQueryData<SavedItemRow[]>(qk.savedItems());
      queryClient.setQueryData<SavedItemRow[]>(qk.savedItems(), []);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qk.savedItems(), context.previous);
      }
      toast.error("Failed to clear saved items.");
    },
    onSuccess: () => {
      toast.success("Saved items cleared.");
    },
    onSettled: () => {
      setConfirmClearAll(false);
      queryClient.invalidateQueries({ queryKey: qk.savedItems() });
    },
  });

  const items = savedItems ?? [];
  const hasItems = items.length > 0;

  return (
    <>
      <AppHeader
        title="Saved Items"
        rightElement={
          <button
            onClick={() => setConfirmClearAll(true)}
            disabled={!hasItems}
            className={cn(
              "text-sm font-semibold text-[var(--color-primary)]",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            Clear all
          </button>
        }
      />
      <PageContainer size="md">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[76px] w-full rounded-[16px]" />
            ))}
          </div>
        ) : !hasItems ? (
          <EmptyState
            icon={<Bookmark className="h-7 w-7" />}
            title="Empty Library"
            message="Save phrases and articles to access them quickly later."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => {
              const title = item.item_data?.title || "Untitled Item";
              return (
                <GlassCard
                  key={item.id}
                  className="flex items-center gap-4 rounded-[16px] p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-gradient">
                    <Bookmark className="h-5 w-5 text-white" fill="currentColor" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-[var(--foreground)]">
                      {title}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-[var(--color-primary)]">
                        {formatType(item.item_type)}
                      </span>
                      <span className="text-[var(--muted)]">•</span>
                      <span className="text-[var(--muted)]">
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => unsaveMutation.mutate(item.id)}
                    aria-label="Remove from saved items"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--input)] hover:text-[var(--error)]"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </GlassCard>
              );
            })}
          </div>
        )}
      </PageContainer>

      {confirmClearAll && (
        <ConfirmDialog
          title="Clear All"
          message="Are you sure you want to remove all saved items? This can't be undone."
          confirmLabel="Clear All"
          loading={clearAllMutation.isPending}
          onConfirm={() => clearAllMutation.mutate()}
          onCancel={() => setConfirmClearAll(false)}
        />
      )}
    </>
  );
}
