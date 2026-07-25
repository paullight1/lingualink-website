"use client";

/** Owner: Agent 6 — home feed. Feed/Trending/Live tabs, stories rail, inline
 *  search, and manual refresh, backed by React Query + Supabase. */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Radio, Rss, TrendingUp } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState, SegmentedTabs, Skeleton } from "@/components/ui";
import { FeedPost } from "@/components/feed/FeedPost";
import { StoriesRail } from "@/components/feed/StoriesRail";
import { useCurrentUserId } from "@/lib/query/hooks";
import { useRealtime } from "@/lib/query/useRealtime";
import { qk } from "@/lib/query/keys";
import type { Post } from "@/lib/types";

import { FeedTopBar } from "./FeedTopBar";
import { LiveStreamCard } from "./LiveStreamCard";
import {
  fetchFeedPosts,
  fetchFeedStories,
  fetchLiveStreams,
  fetchTrendingPosts,
} from "./queries";
import type { FeedTab } from "./types";
import type { LiveStream } from "@/lib/api/live";

function matchesSearch(post: Post, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    !!post.content.phrase?.toLowerCase().includes(q) ||
    !!post.content.translation?.toLowerCase().includes(q) ||
    !!post.content.storyTitle?.toLowerCase().includes(q) ||
    post.user.username.toLowerCase().includes(q) ||
    post.user.name.toLowerCase().includes(q)
  );
}

export default function FeedPage() {
  const currentUserId = useCurrentUserId();
  const [tab, setTab] = useState<FeedTab>("feed");
  const [searchQuery, setSearchQuery] = useState("");

  const storiesQuery = useQuery({
    queryKey: qk.stories(),
    queryFn: fetchFeedStories,
    staleTime: 60_000,
  });

  const feedQuery = useQuery({
    queryKey: qk.feed("feed", currentUserId),
    queryFn: () => fetchFeedPosts(currentUserId),
    staleTime: 30_000,
  });

  const trendingQuery = useQuery({
    queryKey: qk.feed("trending", currentUserId),
    queryFn: () => fetchTrendingPosts(currentUserId),
    enabled: tab === "trending",
    staleTime: 30_000,
  });

  const liveQuery = useQuery({
    queryKey: qk.feed("live", currentUserId),
    queryFn: fetchLiveStreams,
    enabled: tab === "live",
    staleTime: 15_000,
  });

  // Mirrors the mobile `global_feed` channel: new content from any client
  // (including the Expo app) shows up without a manual refresh.
  useRealtime(
    "global_feed",
    [
      { table: "voice_clips", event: "INSERT" },
      { table: "video_clips", event: "INSERT" },
      { table: "stories", event: "INSERT" },
    ],
    () => {
      feedQuery.refetch();
      storiesQuery.refetch();
      if (tab === "trending") trendingQuery.refetch();
    }
  );

  const activeQuery = tab === "feed" ? feedQuery : tab === "trending" ? trendingQuery : liveQuery;
  const refreshing = activeQuery.isFetching;

  const visiblePosts = useMemo(() => {
    const posts = (tab === "trending" ? trendingQuery.data : feedQuery.data) ?? [];
    return posts.filter((p) => matchesSearch(p, searchQuery));
  }, [tab, feedQuery.data, trendingQuery.data, searchQuery]);

  const handleRefresh = () => {
    activeQuery.refetch();
    if (tab === "feed") storiesQuery.refetch();
  };

  const postsLoading = tab === "trending" ? trendingQuery.isLoading : feedQuery.isLoading;
  const postsError = tab === "trending" ? trendingQuery.isError : feedQuery.isError;

  return (
    <div className="flex min-h-full flex-col">
      <FeedTopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <PageContainer size="sm" className="pb-8 pt-3">
        <SegmentedTabs
          variant="underline"
          value={tab}
          onChange={(key) => setTab(key as FeedTab)}
          className="mb-4"
          tabs={[
            { key: "feed", label: "Feed", icon: <Rss className="h-4 w-4" /> },
            { key: "trending", label: "Trending", icon: <TrendingUp className="h-4 w-4" /> },
            { key: "live", label: "Live", icon: <Radio className="h-4 w-4" /> },
          ]}
        />

        {tab === "live" ? (
          <LiveSection loading={liveQuery.isLoading} streams={liveQuery.data ?? []} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Always rendered on the feed tab — the rail leads with the
                viewer's own "add story" bubble even when nobody has posted. */}
            {tab === "feed" && <StoriesRail stories={storiesQuery.data ?? []} />}

            {postsLoading ? (
              <FeedSkeleton />
            ) : postsError ? (
              <EmptyState
                icon={<Rss className="h-7 w-7" />}
                title="Couldn't load the feed"
                message="Something went wrong reaching LinguaLink. Try refreshing."
              />
            ) : visiblePosts.length === 0 ? (
              <EmptyState
                icon={<Rss className="h-7 w-7" />}
                title={searchQuery ? "No matches" : "Nothing here yet"}
                message={
                  searchQuery
                    ? "Try a different search term."
                    : "Be the first to share a phrase, video, or story."
                }
              />
            ) : (
              <div className="flex flex-col gap-4">
                {visiblePosts.map((post) => (
                  <FeedPost
                    key={`${post.type}-${post.id}`}
                    post={post}
                    currentUserId={currentUserId ?? undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

function LiveSection({
  loading,
  streams,
}: {
  loading: boolean;
  streams: LiveStream[];
}) {
  if (loading) return <FeedSkeleton count={2} />;

  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/live/new"
        className="flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-glow"
      >
        <Radio className="h-4 w-4" />
        Go Live
      </Link>

      {streams.length === 0 ? (
        <EmptyState
          icon={<Radio className="h-7 w-7" />}
          title="No live streams right now"
          message="Be the first to go live today."
        />
      ) : (
        streams.map((stream) => (
          <LiveStreamCard key={stream.id} stream={stream} />
        ))
      )}
    </div>
  );
}

function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full rounded-[16px]" />
      ))}
    </div>
  );
}
