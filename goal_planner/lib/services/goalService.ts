import { createClient } from "@/lib/supabase/client";
import type { Task, Habit, GoalData, GoalRow, UnassignedItem } from "@/types/goal";

export interface DeleteResult {
    success: boolean;
    error?: string;
}

/** Fetch a single goal by ID */
export async function fetchGoalById(id: number): Promise<GoalRow> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

    if (error) throw new Error(`Failed to fetch goal: ${error.message}`);
    if (!data) throw new Error("Goal not found or has been deleted");
    return data;
}

/** Create a new goal, returns the created goal row */
export async function createGoal(
    userId: string,
    goalData: GoalData,
): Promise<GoalRow> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("goals")
        .insert({ ...goalData, user_id: userId, status: "active" })
        .select()
        .single();

    if (error) throw new Error(`Failed to create goal: ${error.message}`);
    if (!data) throw new Error("No goal returned from database");
    return data;
}

/** Update an existing goal */
export async function updateGoal(
    goalId: number,
    goalData: GoalData,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from("goals")
        .update({ ...goalData, updated_at: new Date().toISOString() })
        .eq("id", goalId);

    if (error) throw new Error(`Failed to update goal: ${error.message}`);
}

/** Fetch goals list (id + name) for select dropdowns */
export async function fetchUserGoalsList(
    userId: string,
): Promise<{ id: number; name: string }[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from("goals")
        .select("id, name")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("name");

    return data || [];
}

/** Check if a goal has at least one task or habit */
export async function goalHasTasksOrHabits(goalId: number): Promise<boolean> {
    const supabase = createClient();
    const [{ data: tasks }, { data: habits }] = await Promise.all([
        supabase
            .from("tasks")
            .select("id")
            .eq("goal_id", goalId)
            .is("deleted_at", null)
            .limit(1),
        supabase
            .from("habits")
            .select("id")
            .eq("goal_id", goalId)
            .is("deleted_at", null)
            .limit(1),
    ]);
    return ((tasks?.length ?? 0) > 0) || ((habits?.length ?? 0) > 0);
}

/** Fetch tasks and habits for a specific goal with repeat days and logs */
export async function fetchTasksAndHabitsForGoal(
    goalId: number,
): Promise<{ tasks: Task[]; habits: Habit[] }> {
    const supabase = createClient();

    // Fetch tasks
    const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, name, start_date, end_date")
        .eq("goal_id", goalId)
        .is("deleted_at", null);

    const taskIds = tasksData?.map((t) => t.id) || [];

    const [{ data: taskRepeatDays }, { data: taskLogs }] = await Promise.all([
        taskIds.length > 0
            ? supabase
                  .from("task_repeat_days")
                  .select("task_id, day")
                  .in("task_id", taskIds)
            : Promise.resolve({ data: [] as { task_id: number; day: string }[] }),
        taskIds.length > 0
            ? supabase
                  .from("task_logs")
                  .select("task_id, date, start_time, end_time")
                  .in("task_id", taskIds)
            : Promise.resolve(
                  { data: [] as { task_id: number; date: string; start_time: string | null; end_time: string | null }[] },
              ),
    ]);

    // Build lookup maps
    const taskRepeatDaysMap = new Map<number, string[]>();
    taskRepeatDays?.forEach((item: { task_id: number; day: string }) => {
        if (!taskRepeatDaysMap.has(item.task_id)) {
            taskRepeatDaysMap.set(item.task_id, []);
        }
        taskRepeatDaysMap.get(item.task_id)!.push(item.day);
    });

    const taskLogsMap = new Map<number, { date: string; start_time: string | null; end_time: string | null }[]>();
    taskLogs?.forEach((log: { task_id: number; date: string; start_time: string | null; end_time: string | null }) => {
        if (!taskLogsMap.has(log.task_id)) {
            taskLogsMap.set(log.task_id, []);
        }
        taskLogsMap.get(log.task_id)!.push(log);
    });

    const tasks: Task[] = (tasksData || []).map((task) => {
        const repeatDays = taskRepeatDaysMap.get(task.id) || [];
        const logs = taskLogsMap.get(task.id) || [];
        let logDate = null;
        if (!task.start_date && !task.end_date) {
            logDate = logs.length > 0 ? logs[0].date : null;
        }
        const logWithTime = logs.find((l) => l.start_time);
        return {
            id: task.id,
            name: task.name,
            start_time: logWithTime?.start_time ?? null,
            end_time: logWithTime?.end_time ?? null,
            start_date: task.start_date,
            end_date: task.end_date,
            repeat_days: repeatDays,
            log_date: logDate,
        };
    });

    // Fetch habits
    const { data: habitsData } = await supabase
        .from("habits")
        .select("id, name, start_date, end_date")
        .eq("goal_id", goalId)
        .is("deleted_at", null);

    const habitIds = habitsData?.map((h) => h.id) || [];

    const { data: habitRepeatDays } =
        habitIds.length > 0
            ? await supabase
                  .from("habit_repeat_days")
                  .select("habit_id, day")
                  .in("habit_id", habitIds)
            : { data: [] as { habit_id: number; day: string }[] };

    const habitRepeatDaysMap = new Map<number, string[]>();
    habitRepeatDays?.forEach((item: { habit_id: number; day: string }) => {
        if (!habitRepeatDaysMap.has(item.habit_id)) {
            habitRepeatDaysMap.set(item.habit_id, []);
        }
        habitRepeatDaysMap.get(item.habit_id)!.push(item.day);
    });

    const habits: Habit[] = (habitsData || []).map((habit) => ({
        id: habit.id,
        name: habit.name,
        start_date: habit.start_date || "",
        end_date: habit.end_date || "",
        repeat_days: habitRepeatDaysMap.get(habit.id) || [],
    }));

    return { tasks, habits };
}

/** Get current authenticated user ID */
export async function getCurrentUserId(): Promise<string> {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Please login to continue");
    return user.id;
}

/** Fetch tasks and habits not assigned to any goal */
export async function fetchUnassignedItems(
    userId: string,
): Promise<UnassignedItem[]> {
    const supabase = createClient();

    const [{ data: tasks, error: tasksError }, { data: habits, error: habitsError }] =
        await Promise.all([
            supabase
                .from("tasks")
                .select("id, name, start_date, end_date")
                .eq("user_id", userId)
                .is("goal_id", null)
                .is("deleted_at", null),
            supabase
                .from("habits")
                .select("id, name, start_date, end_date")
                .eq("user_id", userId)
                .is("goal_id", null)
                .is("deleted_at", null),
        ]);

    if (tasksError) console.error("Error fetching unassigned tasks:", tasksError);
    if (habitsError) console.error("Error fetching unassigned habits:", habitsError);

    const taskIds = (tasks || []).map((t: { id: number }) => t.id);
    const habitIds = (habits || []).map((h: { id: number }) => h.id);

    const [{ data: taskRepeatDays }, { data: habitRepeatDays }, { data: taskLogs }] =
        await Promise.all([
            taskIds.length > 0
                ? supabase
                      .from("task_repeat_days")
                      .select("task_id, day")
                      .in("task_id", taskIds)
                : Promise.resolve({ data: [] as { task_id: number; day: string }[] }),
            habitIds.length > 0
                ? supabase
                      .from("habit_repeat_days")
                      .select("habit_id, day")
                      .in("habit_id", habitIds)
                : Promise.resolve({ data: [] as { habit_id: number; day: string }[] }),
            taskIds.length > 0
                ? supabase
                      .from("task_logs")
                      .select("task_id, start_time, end_time")
                      .in("task_id", taskIds)
                : Promise.resolve(
                      { data: [] as { task_id: number; start_time: string | null; end_time: string | null }[] },
                  ),
        ]);

    // Build lookup maps
    const taskDaysMap = new Map<number, string[]>();
    (taskRepeatDays || []).forEach((d: { task_id: number; day: string }) => {
        const arr = taskDaysMap.get(d.task_id) || [];
        arr.push(d.day);
        taskDaysMap.set(d.task_id, arr);
    });

    const habitDaysMap = new Map<number, string[]>();
    (habitRepeatDays || []).forEach((d: { habit_id: number; day: string }) => {
        const arr = habitDaysMap.get(d.habit_id) || [];
        arr.push(d.day);
        habitDaysMap.set(d.habit_id, arr);
    });

    const taskTimeMap = new Map<number, { start_time: string | null; end_time: string | null }>();
    (taskLogs || []).forEach(
        (l: { task_id: number; start_time: string | null; end_time: string | null }) => {
            if (l.start_time && !taskTimeMap.has(l.task_id)) {
                taskTimeMap.set(l.task_id, {
                    start_time: l.start_time,
                    end_time: l.end_time,
                });
            }
        },
    );

    return [
        ...(tasks || []).map(
            (t: { id: number; name: string; start_date: string | null; end_date: string | null }) => {
                const repeatDays = taskDaysMap.get(t.id) || [];
                const time = taskTimeMap.get(t.id);
                return {
                    id: t.id,
                    name: t.name,
                    repeat_days: repeatDays,
                    start_date: t.start_date,
                    end_date: t.end_date,
                    start_time: time?.start_time ?? null,
                    end_time: time?.end_time ?? null,
                    type: "task" as const,
                    is_repeating: repeatDays.length > 0,
                };
            },
        ),
        ...(habits || []).map(
            (h: { id: number; name: string; start_date: string | null; end_date: string | null }) => {
                const repeatDays = habitDaysMap.get(h.id) || [];
                return {
                    id: h.id,
                    name: h.name,
                    repeat_days: repeatDays,
                    start_date: h.start_date,
                    end_date: h.end_date,
                    start_time: null,
                    end_time: null,
                    type: "habit" as const,
                    is_repeating: true,
                };
            },
        ),
    ];
}

/** Delete a goal and all its related data (tasks, habits, logs, repeat days) */
export async function deleteGoalWithRelatedData(
    goalId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();

        const { data: tasks } = await supabase
            .from("tasks")
            .select("id")
            .eq("goal_id", goalId);
        const taskIds = tasks?.map((t: { id: number }) => t.id) || [];

        const { data: habits } = await supabase
            .from("habits")
            .select("id")
            .eq("goal_id", goalId);
        const habitIds = habits?.map((h: { id: number }) => h.id) || [];

        if (taskIds.length > 0) {
            const { error } = await supabase
                .from("task_logs")
                .delete()
                .in("task_id", taskIds);
            if (error) throw error;
            const { error: e2 } = await supabase
                .from("task_repeat_days")
                .delete()
                .in("task_id", taskIds);
            if (e2) throw e2;
        }

        if (habitIds.length > 0) {
            const { error } = await supabase
                .from("habit_logs")
                .delete()
                .in("habit_id", habitIds);
            if (error) throw error;
            const { error: e2 } = await supabase
                .from("habit_repeat_days")
                .delete()
                .in("habit_id", habitIds);
            if (e2) throw e2;
        }

        if (taskIds.length > 0) {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .in("id", taskIds);
            if (error) throw error;
        }

        if (habitIds.length > 0) {
            const { error } = await supabase
                .from("habits")
                .delete()
                .in("id", habitIds);
            if (error) throw error;
        }

        const { error } = await supabase
            .from("goals")
            .delete()
            .eq("id", goalId);
        if (error) throw error;

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting goal with related data:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred",
        };
    }
}

/** Bulk delete all tasks for a user (settings page) */
export async function bulkDeleteUserTasks(userId: string): Promise<void> {
    const supabase = createClient();

    const { data: tasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("user_id", userId);
    const taskIds = (tasks || []).map((t: { id: number }) => t.id);

    if (taskIds.length > 0) {
        const { error } = await supabase
            .from("task_repeat_days")
            .delete()
            .in("task_id", taskIds);
        if (error) throw error;
    }

    const { error: logsErr } = await supabase
        .from("task_logs")
        .delete()
        .eq("user_id", userId);
    if (logsErr) throw logsErr;

    const { error: tasksErr } = await supabase
        .from("tasks")
        .delete()
        .eq("user_id", userId);
    if (tasksErr) throw tasksErr;
}

/** Bulk delete all habits for a user (settings page) */
export async function bulkDeleteUserHabits(userId: string): Promise<void> {
    const supabase = createClient();

    const { data: habits } = await supabase
        .from("habits")
        .select("id")
        .eq("user_id", userId);
    const habitIds = (habits || []).map((h: { id: number }) => h.id);

    if (habitIds.length > 0) {
        const { error } = await supabase
            .from("habit_repeat_days")
            .delete()
            .in("habit_id", habitIds);
        if (error) throw error;
    }

    const { error: logsErr } = await supabase
        .from("habit_logs")
        .delete()
        .eq("user_id", userId);
    if (logsErr) throw logsErr;

    const { error: habitsErr } = await supabase
        .from("habits")
        .delete()
        .eq("user_id", userId);
    if (habitsErr) throw habitsErr;
}

/** Bulk delete all goals (and all tasks+habits) for a user */
export async function bulkDeleteUserGoals(userId: string): Promise<void> {
    await bulkDeleteUserTasks(userId);
    await bulkDeleteUserHabits(userId);

    const supabase = createClient();
    const { error } = await supabase
        .from("goals")
        .delete()
        .eq("user_id", userId);
    if (error) throw error;
}
