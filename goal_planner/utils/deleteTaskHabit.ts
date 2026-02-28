import { createClient } from "@/lib/supabase/client";
import { getTodayDateString } from "@/lib/constants/validation";
import type { SupabaseClient } from "@supabase/supabase-js";

// ===== TYPE DEFINITIONS =====

/**
 * Result type for delete operations
 */
export interface DeleteResult {
    success: boolean;
    error?: string;
}

/**
 * Deletes task repeat days for a given task
 * @param supabase - Supabase client
 * @param taskId - Task ID
 */
const deleteTaskRepeatDays = async (
    supabase: SupabaseClient,
    taskId: number,
): Promise<void> => {
    const { error } = await supabase
        .from("task_repeat_days")
        .delete()
        .eq("task_id", taskId);

    if (error) {
        console.error("Error deleting task_repeat_days:", error);
        throw new Error(`Failed to delete task repeat days: ${error.message}`);
    }
};

/**
 * Deletes habit repeat days for a given habit
 * @param supabase - Supabase client
 * @param habitId - Habit ID
 */
const deleteHabitRepeatDays = async (
    supabase: SupabaseClient,
    habitId: number,
): Promise<void> => {
    const { error } = await supabase
        .from("habit_repeat_days")
        .delete()
        .eq("habit_id", habitId);

    if (error) {
        console.error("Error deleting habit_repeat_days:", error);
        throw new Error(`Failed to delete habit repeat days: ${error.message}`);
    }
};

// ===== EXPORTED DELETE FUNCTIONS =====

/**
 * Deletes a task and its related data from today onwards (inclusive)
 *
 * This function performs the following deletions:
 * 1. Task logs from today onwards (past logs are preserved for history)
 * 2. Task repeat days configuration
 * 3. The task itself
 *
 * @param taskId - The ID of the task to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteTaskWithFutureLogs(
    taskId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        const today = getTodayDateString();

        // 1. Delete task_logs from today onwards (preserve historical data)
        const { error: taskLogsError } = await supabase
            .from("task_logs")
            .delete()
            .eq("task_id", taskId)
            .gte("date", today);

        if (taskLogsError) {
            console.error("Error deleting task_logs:", taskLogsError);
            throw new Error(
                `Failed to delete task logs: ${taskLogsError.message}`,
            );
        }

        // 2. Delete task_repeat_days for this task
        await deleteTaskRepeatDays(supabase, taskId);

        // 3. Delete the task
        const { error: deleteTaskError } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);

        if (deleteTaskError) {
            console.error("Error deleting task:", deleteTaskError);
            throw new Error(
                `Failed to delete task: ${deleteTaskError.message}`,
            );
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting task with future logs:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}

/**
 * Deletes a habit and its related data from today onwards (inclusive)
 *
 * This function performs the following deletions:
 * 1. Habit logs from today onwards (past logs are preserved for history)
 * 2. Habit repeat days configuration
 * 3. The habit itself
 *
 * @param habitId - The ID of the habit to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteHabitWithFutureLogs(
    habitId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        const today = getTodayDateString();

        // 1. Delete habit_logs from today onwards (preserve historical data)
        const { error: habitLogsError } = await supabase
            .from("habit_logs")
            .delete()
            .eq("habit_id", habitId)
            .gte("date", today);

        if (habitLogsError) {
            console.error("Error deleting habit_logs:", habitLogsError);
            throw new Error(
                `Failed to delete habit logs: ${habitLogsError.message}`,
            );
        }

        // 2. Delete habit_repeat_days for this habit
        await deleteHabitRepeatDays(supabase, habitId);

        // 3. Delete the habit
        const { error: deleteHabitError } = await supabase
            .from("habits")
            .delete()
            .eq("id", habitId);

        if (deleteHabitError) {
            console.error("Error deleting habit:", deleteHabitError);
            throw new Error(
                `Failed to delete habit: ${deleteHabitError.message}`,
            );
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting habit with future logs:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}

/**
 * Deletes a specific task log entry from the calendar
 * If this is the last log for the task, it will also delete the entire task
 * and its related data (repeat days) to keep the UI clean
 *
 * @param logId - The ID of the task log to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteTaskLog(logId: number): Promise<DeleteResult> {
    try {
        const supabase = createClient();

        // 1. First, get the task_id from the log before deleting
        const { data: logData, error: fetchError } = await supabase
            .from("task_logs")
            .select("task_id")
            .eq("id", logId)
            .single();

        if (fetchError || !logData) {
            console.error("Error fetching task log:", fetchError);
            throw new Error(
                `Failed to fetch task log: ${fetchError?.message || "Log not found"}`,
            );
        }

        const taskId = logData.task_id;

        // 2. Count total logs for this task
        const { count, error: countError } = await supabase
            .from("task_logs")
            .select("*", { count: "exact", head: true })
            .eq("task_id", taskId);

        if (countError) {
            console.error("Error counting task logs:", countError);
            throw new Error(`Failed to count task logs: ${countError.message}`);
        }

        // 3. Delete the log
        const { error: deleteLogError } = await supabase
            .from("task_logs")
            .delete()
            .eq("id", logId);

        if (deleteLogError) {
            console.error("Error deleting task log:", deleteLogError);
            throw new Error(
                `Failed to delete task log: ${deleteLogError.message}`,
            );
        }

        // 4. If this was the last log, delete the entire task and its repeat days
        if (count === 1) {
            try {
                await deleteTaskRepeatDays(supabase, taskId);
            } catch (error) {
                // Log but don't fail - the log is already deleted
                console.error(
                    "Non-critical error deleting task_repeat_days:",
                    error,
                );
            }

            // Delete the task itself
            const { error: deleteTaskError } = await supabase
                .from("tasks")
                .delete()
                .eq("id", taskId);

            if (deleteTaskError) {
                console.error(
                    "Non-critical error deleting task:",
                    deleteTaskError,
                );
                // Log but don't fail - the log is already deleted
            }
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting task log:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}

/**
 * Deletes a specific habit log entry from the calendar
 * If this is the last log for the habit, it will also delete the entire habit
 * and its related data (repeat days) to keep the UI clean
 *
 * @param logId - The ID of the habit log to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteHabitLog(logId: number): Promise<DeleteResult> {
    try {
        const supabase = createClient();

        // 1. First, get the habit_id from the log before deleting
        const { data: logData, error: fetchError } = await supabase
            .from("habit_logs")
            .select("habit_id")
            .eq("id", logId)
            .single();

        if (fetchError || !logData) {
            console.error("Error fetching habit log:", fetchError);
            throw new Error(
                `Failed to fetch habit log: ${fetchError?.message || "Log not found"}`,
            );
        }

        const habitId = logData.habit_id;

        // 2. Count total logs for this habit
        const { count, error: countError } = await supabase
            .from("habit_logs")
            .select("*", { count: "exact", head: true })
            .eq("habit_id", habitId);

        if (countError) {
            console.error("Error counting habit logs:", countError);
            throw new Error(
                `Failed to count habit logs: ${countError.message}`,
            );
        }

        // 3. Delete the log
        const { error: deleteLogError } = await supabase
            .from("habit_logs")
            .delete()
            .eq("id", logId);

        if (deleteLogError) {
            console.error("Error deleting habit log:", deleteLogError);
            throw new Error(
                `Failed to delete habit log: ${deleteLogError.message}`,
            );
        }

        // 4. If this was the last log, delete the entire habit and its repeat days
        if (count === 1) {
            try {
                await deleteHabitRepeatDays(supabase, habitId);
            } catch (error) {
                // Log but don't fail - the log is already deleted
                console.error(
                    "Non-critical error deleting habit_repeat_days:",
                    error,
                );
            }

            // Delete the habit itself
            const { error: deleteHabitError } = await supabase
                .from("habits")
                .delete()
                .eq("id", habitId);

            if (deleteHabitError) {
                console.error(
                    "Non-critical error deleting habit:",
                    deleteHabitError,
                );
                // Log but don't fail - the log is already deleted
            }
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting habit log:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}

/**
 * Deletes a task and ALL its related data (all logs, repeat days).
 * Used for unassigned task deletion where we want complete removal.
 */
export async function deleteTaskCompletely(
    taskId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        await supabase.from("task_logs").delete().eq("task_id", taskId);
        await supabase.from("task_repeat_days").delete().eq("task_id", taskId);
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", taskId);
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}

/**
 * Deletes a habit and ALL its related data (all logs, repeat days).
 * Used for unassigned habit deletion where we want complete removal.
 */
export async function deleteHabitCompletely(
    habitId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        await supabase.from("habit_logs").delete().eq("habit_id", habitId);
        await supabase
            .from("habit_repeat_days")
            .delete()
            .eq("habit_id", habitId);
        const { error } = await supabase
            .from("habits")
            .delete()
            .eq("id", habitId);
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}
