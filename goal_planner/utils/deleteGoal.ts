import { createClient } from "@/lib/supabase/client";

export async function deleteGoalWithRelatedData(goalId: number): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = createClient();

        // 1. Get all tasks for this goal
        const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("id")
            .eq("goal_id", goalId);

        if (tasksError) {
            console.error("Error fetching tasks:", tasksError);
            throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
        }

        const taskIds = tasks?.map((t) => t.id) || [];

        // 2. Get all habits for this goal
        const { data: habits, error: habitsError } = await supabase
            .from("habits")
            .select("id")
            .eq("goal_id", goalId);

        if (habitsError) {
            console.error("Error fetching habits:", habitsError);
            throw new Error(`Failed to fetch habits: ${habitsError.message}`);
        }

        const habitIds = habits?.map((h) => h.id) || [];

        // 3. Delete task_logs for these tasks
        if (taskIds.length > 0) {
            const { error: taskLogsError } = await supabase
                .from("task_logs")
                .delete()
                .in("task_id", taskIds);

            if (taskLogsError) {
                console.error("Error deleting task_logs:", taskLogsError);
                throw new Error(
                    `Failed to delete task logs: ${taskLogsError.message}`,
                );
            }
        }

        // 4. Delete task_repeat_days for these tasks
        if (taskIds.length > 0) {
            const { error: taskRepeatDaysError } = await supabase
                .from("task_repeat_days")
                .delete()
                .in("task_id", taskIds);

            if (taskRepeatDaysError) {
                console.error(
                    "Error deleting task_repeat_days:",
                    taskRepeatDaysError,
                );
                throw new Error(
                    `Failed to delete task repeat days: ${taskRepeatDaysError.message}`,
                );
            }
        }

        // 5. Delete habit_logs for these habits
        if (habitIds.length > 0) {
            const { error: habitLogsError } = await supabase
                .from("habit_logs")
                .delete()
                .in("habit_id", habitIds);

            if (habitLogsError) {
                console.error("Error deleting habit_logs:", habitLogsError);
                throw new Error(
                    `Failed to delete habit logs: ${habitLogsError.message}`,
                );
            }
        }

        // 6. Delete habit_repeat_days for these habits
        if (habitIds.length > 0) {
            const { error: habitRepeatDaysError } = await supabase
                .from("habit_repeat_days")
                .delete()
                .in("habit_id", habitIds);

            if (habitRepeatDaysError) {
                console.error(
                    "Error deleting habit_repeat_days:",
                    habitRepeatDaysError,
                );
                throw new Error(
                    `Failed to delete habit repeat days: ${habitRepeatDaysError.message}`,
                );
            }
        }

        // 7. Delete tasks
        if (taskIds.length > 0) {
            const { error: deleteTasksError } = await supabase
                .from("tasks")
                .delete()
                .in("id", taskIds);

            if (deleteTasksError) {
                console.error("Error deleting tasks:", deleteTasksError);
                throw new Error(
                    `Failed to delete tasks: ${deleteTasksError.message}`,
                );
            }
        }

        // 8. Delete habits
        if (habitIds.length > 0) {
            const { error: deleteHabitsError } = await supabase
                .from("habits")
                .delete()
                .in("id", habitIds);

            if (deleteHabitsError) {
                console.error("Error deleting habits:", deleteHabitsError);
                throw new Error(
                    `Failed to delete habits: ${deleteHabitsError.message}`,
                );
            }
        }

        // 9. Finally, delete the goal
        const { error: deleteGoalError } = await supabase
            .from("goals")
            .delete()
            .eq("id", goalId);

        if (deleteGoalError) {
            console.error("Error deleting goal:", deleteGoalError);
            throw new Error(
                `Failed to delete goal: ${deleteGoalError.message}`,
            );
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting goal with related data:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}
