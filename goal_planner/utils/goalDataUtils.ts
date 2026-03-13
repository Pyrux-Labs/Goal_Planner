/**
 * Shared goal data fetching and formatting utilities.
 * Extracted from anual-goals and onboarding to eliminate duplication.
 * Uses optimized batch queries with O(1) lookup maps.
 */

import { createClient } from "@/lib/supabase/client";
import type { Task, Habit, GoalRow, GoalWithDetails, FormattedTask, FormattedHabit, FormattedGoal } from "@/types/goal";
import type { TaskEditData, HabitEditData } from "@/types/sidebar";
import {
    formatRepeatDays,
    formatTime,
    formatDateShort,
    formatTargetDate,
    capitalizeFirst,
} from "@/utils/formatUtils";

// ===== TYPES =====

/** Log entry from task_logs / habit_logs */
interface LogEntry {
    completed: boolean;
    date: string;
    start_time?: string | null;
    end_time?: string | null;
}

/** Raw task row from Supabase */
interface TaskRow {
    id: number;
    goal_id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
}

/** Raw habit row from Supabase */
interface HabitRow {
    id: number;
    goal_id: number;
    name: string;
    start_date: string | null;
    end_date: string | null;
}

/** Repeat day row */
interface RepeatDayRow {
    [key: string]: number | string;
}

// ===== LOOKUP MAP BUILDER =====

/** Builds a Map grouping items by a key field for O(1) access */
function buildLookupMap<T>(
    items: T[] | null | undefined,
    keyField: keyof T,
): Map<number, T[]> {
    const map = new Map<number, T[]>();
    items?.forEach((item) => {
        const key = item[keyField] as unknown as number;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
    });
    return map;
}

/** Builds a Map grouping string values by a key field */
function buildStringLookupMap(
    items: RepeatDayRow[] | null | undefined,
    keyField: string,
    valueField: string,
): Map<number, string[]> {
    const map = new Map<number, string[]>();
    items?.forEach((item) => {
        const key = item[keyField] as number;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item[valueField] as string);
    });
    return map;
}

// ===== DATA FETCHING =====

/**
 * Fetches all goals with associated tasks, habits, and logs using optimized batch queries.
 * Builds lookup maps for O(1) access and calculates progress per goal.
 */
export async function fetchAllGoalsData(
    userId: string,
): Promise<GoalWithDetails[]> {
    const supabase = createClient();
    const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (goalsError || !goalsData || goalsData.length === 0) return [];

    const goalIds = goalsData.map((g: GoalRow) => g.id);

    // Batch fetch tasks and habits
    const [{ data: allTasks }, { data: allHabits }] = await Promise.all([
        supabase
            .from("tasks")
            .select("id, goal_id, name, start_date, end_date")
            .in("goal_id", goalIds)
            .is("deleted_at", null),
        supabase
            .from("habits")
            .select("id, goal_id, name, start_date, end_date")
            .in("goal_id", goalIds)
            .is("deleted_at", null),
    ]);

    const taskIds = (allTasks as TaskRow[] | null)?.map((t) => t.id) || [];
    const habitIds = (allHabits as HabitRow[] | null)?.map((h) => h.id) || [];

    // Batch fetch related data
    const [
        { data: allTaskRepeatDays },
        { data: allHabitRepeatDays },
        { data: allTaskLogs },
        { data: allHabitLogs },
    ] = await Promise.all([
        taskIds.length > 0
            ? supabase
                  .from("task_repeat_days")
                  .select("task_id, day")
                  .in("task_id", taskIds)
            : Promise.resolve({ data: [] }),
        habitIds.length > 0
            ? supabase
                  .from("habit_repeat_days")
                  .select("habit_id, day")
                  .in("habit_id", habitIds)
            : Promise.resolve({ data: [] }),
        taskIds.length > 0
            ? supabase
                  .from("task_logs")
                  .select("task_id, completed, date, start_time, end_time")
                  .in("task_id", taskIds)
            : Promise.resolve({ data: [] }),
        habitIds.length > 0
            ? supabase
                  .from("habit_logs")
                  .select("habit_id, completed, date")
                  .in("habit_id", habitIds)
            : Promise.resolve({ data: [] }),
    ]);

    // Build lookup maps
    const tasksByGoalId = buildLookupMap(
        allTasks as TaskRow[] | null,
        "goal_id",
    );
    const habitsByGoalId = buildLookupMap(
        allHabits as HabitRow[] | null,
        "goal_id",
    );
    const taskRepeatDaysMap = buildStringLookupMap(
        allTaskRepeatDays as RepeatDayRow[] | null,
        "task_id",
        "day",
    );
    const habitRepeatDaysMap = buildStringLookupMap(
        allHabitRepeatDays as RepeatDayRow[] | null,
        "habit_id",
        "day",
    );
    const taskLogsMap = buildLookupMap(
        allTaskLogs as (LogEntry & { task_id: number })[] | null,
        "task_id",
    );
    const habitLogsMap = buildLookupMap(
        allHabitLogs as (LogEntry & { habit_id: number })[] | null,
        "habit_id",
    );

    return goalsData.map((goal: GoalRow) => {
        const goalTasks = tasksByGoalId.get(goal.id) || [];
        const goalHabits = habitsByGoalId.get(goal.id) || [];

        const tasks: Task[] = (goalTasks as TaskRow[]).map((task) => {
            const repeatDays = taskRepeatDaysMap.get(task.id) || [];
            const logs =
                (
                    taskLogsMap as Map<
                        number,
                        (LogEntry & { task_id: number })[]
                    >
                ).get(task.id) || [];
            let logDate: string | null = null;
            if (!task.start_date && !task.end_date) {
                logDate = logs.length > 0 ? logs[0].date : null;
            }
            // Extract representative time from any log that has it
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

        const habits: Habit[] = (goalHabits as HabitRow[]).map((habit) => ({
            id: habit.id,
            name: habit.name,
            start_date: habit.start_date || "",
            end_date: habit.end_date || "",
            repeat_days: habitRepeatDaysMap.get(habit.id) || [],
        }));

        let totalLogs = 0;
        let completedLogs = 0;

        tasks.forEach((task) => {
            const logs =
                (taskLogsMap as Map<number, LogEntry[]>).get(task.id) || [];
            totalLogs += logs.length;
            completedLogs += logs.filter((l) => l.completed).length;
        });

        habits.forEach((habit) => {
            const logs =
                (habitLogsMap as Map<number, LogEntry[]>).get(habit.id) || [];
            totalLogs += logs.length;
            completedLogs += logs.filter((l) => l.completed).length;
        });

        const progress =
            totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

        return {
            id: goal.id,
            name: goal.name,
            description: goal.description,
            category: goal.category,
            status: goal.status,
            color: goal.color,
            target_date: goal.target_date,
            start_date: goal.start_date,
            created_at: goal.created_at,
            tasks,
            habits,
            progress,
            totalLogs,
            taskLogsMap: taskLogsMap as Map<number, LogEntry[]>,
            habitLogsMap: habitLogsMap as Map<number, LogEntry[]>,
        };
    });
}

// ===== PROGRESS CALCULATIONS =====

/**
 * Calculate overall year progress as a weighted average.
 * Weight is based on log count, so goals with more activity
 * have proportionally larger impact.
 */
export function calculateYearProgress(goals: GoalWithDetails[]): number {
    const currentYear = new Date().getFullYear();
    const yearGoals = goals.filter(
        (g) => new Date(g.target_date).getFullYear() === currentYear,
    );

    if (yearGoals.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    yearGoals.forEach((goal) => {
        if (goal.totalLogs > 0) {
            weightedSum += goal.progress * goal.totalLogs;
            totalWeight += goal.totalLogs;
        }
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ===== FORMATTING =====

/**
 * Formats a task for display in GoalCard/summary views.
 * Includes edit data for inline editing support.
 */
export function formatTaskForDisplay(
    task: Task,
    goalId: number,
    taskLogsMap?: Map<number, LogEntry[]>,
): FormattedTask {
    let days: string | undefined;
    if (!task.start_date && !task.end_date && task.log_date) {
        days = formatDateShort(task.log_date);
    } else if (task.repeat_days.length > 0) {
        days = formatRepeatDays(task.repeat_days);
    }

    const taskLogs = taskLogsMap?.get(task.id) || [];
    const allCompleted =
        taskLogs.length > 0 && taskLogs.every((l) => l.completed);

    const editData: TaskEditData = {
        id: task.id,
        goal_id: goalId,
        name: task.name,
        start_date: task.start_date,
        end_date: task.end_date,
        start_time: task.start_time,
        end_time: task.end_time,
        repeat_days: task.repeat_days,
        is_repeating: task.repeat_days.length > 0,
        edit_date: task.log_date ?? undefined,
    };

    return {
        title: task.name,
        days,
        time: formatTime(task.start_time),
        completed: allCompleted,
        editData,
    };
}

/**
 * Formats a habit for display in GoalCard/summary views.
 */
export function formatHabitForDisplay(
    habit: Habit,
    goalId: number,
    habitLogsMap?: Map<number, LogEntry[]>,
): FormattedHabit {
    const habitLogs = habitLogsMap?.get(habit.id) || [];
    const allCompleted =
        habitLogs.length > 0 && habitLogs.every((l) => l.completed);

    const editData: HabitEditData = {
        id: habit.id,
        goal_id: goalId,
        name: habit.name,
        start_date: habit.start_date,
        end_date: habit.end_date,
        repeat_days: habit.repeat_days,
    };

    return {
        title: habit.name,
        days: formatRepeatDays(habit.repeat_days),
        completed: allCompleted,
        editData,
    };
}

/**
 * Formats a goal with all its tasks and habits for display.
 */
export function formatGoalForDisplay(goal: GoalWithDetails): FormattedGoal {
    return {
        ...goal,
        formattedTasks: goal.tasks.map((task) =>
            formatTaskForDisplay(task, goal.id, goal.taskLogsMap),
        ),
        formattedHabits: goal.habits.map((habit) =>
            formatHabitForDisplay(habit, goal.id, goal.habitLogsMap),
        ),
        categoryName: capitalizeFirst(goal.category),
        formattedDate: formatTargetDate(goal.target_date),
    };
}
