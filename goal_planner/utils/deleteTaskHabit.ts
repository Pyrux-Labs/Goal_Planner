import { createClient } from "@/lib/supabase/client";

/**
 * Deletes a task and its related data from today onwards (inclusive)
 * This function performs the following deletions:
 * 1. Task logs from today onwards (past logs are preserved)
 * 2. Task repeat days configuration
 * 3. The task itself
 *
 * @param taskId - The ID of the task to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteTaskWithFutureLogs(taskId: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

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
        const { error: taskRepeatDaysError } = await supabase
            .from("task_repeat_days")
            .delete()
            .eq("task_id", taskId);

        if (taskRepeatDaysError) {
            console.error(
                "Error deleting task_repeat_days:",
                taskRepeatDaysError,
            );
            throw new Error(
                `Failed to delete task repeat days: ${taskRepeatDaysError.message}`,
            );
        }

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
    } catch (error: any) {
        console.error("Error deleting task with future logs:", error);
        return {
            success: false,
            error: error.message || "An unknown error occurred",
        };
    }
}

/**
 * Deletes a habit and its related data from today onwards (inclusive)
 * This function performs the following deletions:
 * 1. Habit logs from today onwards (past logs are preserved)
 * 2. Habit repeat days configuration
 * 3. The habit itself
 *
 * @param habitId - The ID of the habit to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteHabitWithFutureLogs(habitId: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = createClient();
        const today = new Date().toISOString().split("T")[0];

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
        const { error: habitRepeatDaysError } = await supabase
            .from("habit_repeat_days")
            .delete()
            .eq("habit_id", habitId);

        if (habitRepeatDaysError) {
            console.error(
                "Error deleting habit_repeat_days:",
                habitRepeatDaysError,
            );
            throw new Error(
                `Failed to delete habit repeat days: ${habitRepeatDaysError.message}`,
            );
        }

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
    } catch (error: any) {
        console.error("Error deleting habit with future logs:", error);
        return {
            success: false,
            error: error.message || "An unknown error occurred",
        };
    }
}

/**
 * Deletes a specific task log entry from the calendar
 * Used when removing a single occurrence of a task from a specific date
 *
 * @param logId - The ID of the task log to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteTaskLog(logId: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from("task_logs")
            .delete()
            .eq("id", logId);

        if (error) {
            console.error("Error deleting task log:", error);
            throw new Error(`Failed to delete task log: ${error.message}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting task log:", error);
        return {
            success: false,
            error: error.message || "An unknown error occurred",
        };
    }
}

/**
 * Deletes a specific habit log entry from the calendar
 * Used when removing a single occurrence of a habit from a specific date
 *
 * @param logId - The ID of the habit log to delete
 * @returns Promise with success status and error message if any
 */
export async function deleteHabitLog(logId: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = createClient();

        const { error } = await supabase
            .from("habit_logs")
            .delete()
            .eq("id", logId);

        if (error) {
            console.error("Error deleting habit log:", error);
            throw new Error(`Failed to delete habit log: ${error.message}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting habit log:", error);
        return {
            success: false,
            error: error.message || "An unknown error occurred",
        };
    }
}
