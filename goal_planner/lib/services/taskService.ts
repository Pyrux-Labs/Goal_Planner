import { createClient } from "@/lib/supabase/client";
import type { CreateTaskParams, UpdateTaskParams } from "@/types/task";
import { getTodayDateString } from "@/utils/dateUtils";

export interface DeleteResult {
    success: boolean;
    error?: string;
}

/** Create a task with repeat days via RPC */
export async function createTaskWithRepeatDays(
    params: CreateTaskParams,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc("create_task_with_repeat_days", {
        p_goal_id: params.goalId,
        p_name: params.name,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_start_time: params.startTime,
        p_end_time: params.endTime,
        p_is_one_time: params.isOneTime,
        p_one_time_date: params.oneTimeDate,
        p_repeat_days: params.repeatDays,
    });
    if (error?.message) throw error;
}

/** Update a task with repeat days via RPC */
export async function updateTaskWithRepeatDays(
    params: UpdateTaskParams,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_task_with_repeat_days", {
        p_task_id: params.taskId,
        p_goal_id: params.goalId,
        p_name: params.name,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_start_time: params.startTime,
        p_end_time: params.endTime,
        p_repeat_days: params.repeatDays,
    });
    if (error?.message) throw error;
}

/** Delete a task and its related data from today onwards */
export async function deleteTaskWithFutureLogs(
    taskId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        const today = getTodayDateString();

        const { error: logsErr } = await supabase
            .from("task_logs")
            .delete()
            .eq("task_id", taskId)
            .gte("date", today);
        if (logsErr) throw logsErr;

        const { error: rdErr } = await supabase
            .from("task_repeat_days")
            .delete()
            .eq("task_id", taskId);
        if (rdErr) throw rdErr;

        const { error: taskErr } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);
        if (taskErr) throw taskErr;

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting task:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}

/** Delete a task and ALL its related data completely */
export async function deleteTaskCompletely(
    taskId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        await supabase.from("task_logs").delete().eq("task_id", taskId);
        await supabase.from("task_repeat_days").delete().eq("task_id", taskId);
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}

/** Delete a task log; if it's the last log, also delete the task itself */
export async function deleteTaskLog(logId: number): Promise<DeleteResult> {
    try {
        const supabase = createClient();

        const { data: logData, error: fetchErr } = await supabase
            .from("task_logs")
            .select("task_id")
            .eq("id", logId)
            .single();
        if (fetchErr || !logData)
            throw new Error(fetchErr?.message || "Log not found");

        const taskId = logData.task_id;

        const { count, error: countErr } = await supabase
            .from("task_logs")
            .select("*", { count: "exact", head: true })
            .eq("task_id", taskId);
        if (countErr) throw countErr;

        const { error: delErr } = await supabase
            .from("task_logs")
            .delete()
            .eq("id", logId);
        if (delErr) throw delErr;

        if (count === 1) {
            await supabase.from("task_repeat_days").delete().eq("task_id", taskId);
            await supabase.from("tasks").delete().eq("id", taskId);
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting task log:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}
