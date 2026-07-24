"use client";

/** Owner: Agent 10 — Task Feed: fetches the next available task and hands off to /record on accept. */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { AppHeader, EmptyState, Spinner, Skeleton } from "@/components/ui";
import { PageContainer } from "@/components/layout/PageContainer";
import { taskService } from "@/lib/api/tasks";
import { useCurrentUserId } from "@/lib/query/hooks";
import { qk } from "@/lib/query/keys";
import { analytics } from "@/components/providers/PostHogProvider";
import { TaskCard } from "./TaskCard";

export default function TasksPage() {
  const router = useRouter();
  const userId = useCurrentUserId();
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);

  const {
    data: task,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: qk.nextTask(),
    queryFn: () => taskService.getNextTask(),
  });

  const handleRefresh = () => {
    if (starting) return;
    refetch();
  };

  const handleStartTask = async () => {
    if (!task || !userId || starting) return;
    setStarting(true);
    try {
      await taskService.acceptTask(task.id, userId);
      analytics.track("task_started", { taskId: task.id });
      const instruction = task.prompt_data?.instruction ?? "";
      const params = new URLSearchParams({
        mode: "voice",
        taskId: task.id,
        instruction,
      });
      router.push(`/record?${params.toString()}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept task. It may have been taken.");
      queryClient.invalidateQueries({ queryKey: qk.nextTask() });
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <AppHeader
        title="Task Feed"
        showBack={false}
        rightElement={
          <button
            onClick={handleRefresh}
            aria-label="Refresh"
            disabled={isFetching}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-primary)] hover:bg-[var(--input)] disabled:opacity-50"
          >
            <RefreshCw className={isFetching ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
          </button>
        }
      />

      <PageContainer size="sm" className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-sm text-[var(--muted)]">Finding best task for you...</p>
            <div className="w-full space-y-3 opacity-40">
              <Skeleton className="h-40 w-full rounded-[24px]" />
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
          </div>
        ) : isError ? (
          <EmptyState
            icon={<RefreshCw className="h-7 w-7" />}
            title="Couldn't load a task"
            message="Something went wrong reaching the task feed. Please try again."
            action={
              <button
                onClick={handleRefresh}
                className="rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
              >
                Try again
              </button>
            }
            className="flex-1"
          />
        ) : task ? (
          <TaskCard task={task} starting={starting} onStart={handleStartTask} />
        ) : (
          <EmptyState
            icon={<CheckCircle2 className="h-7 w-7" />}
            title="No tasks available right now."
            message="Check back later or try updating your profile."
            className="flex-1"
          />
        )}
      </PageContainer>
    </>
  );
}
