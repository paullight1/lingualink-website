"use client";

/** Start a conversation: mutual follows by default, plus people search. */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus, Users } from "lucide-react";
import toast from "react-hot-toast";

import {
  AppHeader,
  EmptyState,
  SearchInput,
  Skeleton,
  UserAvatar,
} from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { useCurrentUserId } from "@/lib/query/hooks";
import {
  createOrGetDm,
  getMutualFollows,
  searchPeople,
  type ChatParticipant,
} from "@/lib/api/chat";

export default function NewChatPage() {
  const router = useRouter();
  const currentUserId = useCurrentUserId();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [startingWith, setStartingWith] = useState<string | null>(null);

  // Debounce so typing doesn't fire a query per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  const mutualsQuery = useQuery({
    queryKey: ["mutual-follows", currentUserId],
    enabled: !!currentUserId,
    queryFn: () => getMutualFollows(currentUserId as string),
  });

  const searchQuery = useQuery({
    queryKey: ["people-search", debounced, currentUserId],
    enabled: !!currentUserId && debounced.length >= 2,
    queryFn: () => searchPeople(debounced, currentUserId as string),
  });

  const isSearching = debounced.length >= 2;
  const people = useMemo<ChatParticipant[]>(
    () => (isSearching ? searchQuery.data ?? [] : mutualsQuery.data ?? []),
    [isSearching, searchQuery.data, mutualsQuery.data]
  );
  const loading = isSearching ? searchQuery.isLoading : mutualsQuery.isLoading;

  const startChat = async (person: ChatParticipant) => {
    if (!currentUserId || startingWith) return;
    setStartingWith(person.id);
    try {
      const conversationId = await createOrGetDm(person.id);
      router.push(`/chat/${conversationId}`);
    } catch (err) {
      console.error("[chat] could not start DM", err);
      toast.error("Couldn't start that conversation");
      setStartingWith(null);
    }
  };

  return (
    <div className="min-h-full">
      <AppHeader title="New Chat" showBack onBack={() => router.back()} />

      <PageContainer size="sm" className="pb-8">
        <SearchInput
          label="Search people"
          placeholder="Search by name or username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          wrapperClassName="mb-4"
        />

        <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
          {isSearching ? "Search results" : "People you both follow"}
        </h2>

        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[60px] w-full rounded-[16px]" />
            ))}
          </div>
        ) : people.length === 0 ? (
          <EmptyState
            icon={
              isSearching ? (
                <Search className="h-7 w-7" />
              ) : (
                <Users className="h-7 w-7" />
              )
            }
            title={isSearching ? "No people found" : "No mutual follows yet"}
            message={
              isSearching
                ? "Try a different name or username."
                : "Follow people back and forth to start chatting, or search for someone above."
            }
          />
        ) : (
          <ul className="flex flex-col">
            {people.map((person) => {
              const name = person.full_name || person.username || "User";
              return (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => startChat(person)}
                    disabled={!!startingWith}
                    className="flex w-full items-center gap-3 rounded-[16px] px-2 py-3 text-left transition hover:bg-[var(--input)] disabled:opacity-60"
                  >
                    <UserAvatar
                      uri={person.avatar_url ?? undefined}
                      name={name}
                      size={44}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-[var(--foreground)]">
                        {name}
                      </span>
                      <span className="block truncate text-sm text-[var(--muted)]">
                        @{person.username || "user"}
                        {person.primary_language ? ` · ${person.primary_language}` : ""}
                      </span>
                    </span>
                    <UserPlus className="h-5 w-5 shrink-0 text-[var(--color-primary)]" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PageContainer>
    </div>
  );
}
