import { supabase } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";

/**
 * Task service — mirrors mobile src/services/TaskService.ts.
 * Uses the Supabase Edge Function `xum-dispatcher` with a table fallback.
 */
export const taskService = {
  async getNextTask(): Promise<Task | null> {
    try {
      const { data, error } = await supabase.functions.invoke("xum-dispatcher");
      if (!error && data?.task) return data.task as Task;
    } catch {
      /* fall through to direct query */
    }
    const { data } = await supabase
      .from("tasks")
      .select("*, campaigns(*)")
      .eq("status", "available")
      .limit(1)
      .maybeSingle();
    return (data as Task) ?? null;
  },

  async acceptTask(taskId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "assigned", assigned_to: userId })
      .eq("id", taskId);
    if (error) throw error;
  },

  async completeTask(taskId: string, submissionId: string): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "completed", submission_id: submissionId })
      .eq("id", taskId);
    if (error) throw error;
  },
};
