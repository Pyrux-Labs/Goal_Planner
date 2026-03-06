/** Shared type definitions for goals, tasks, and habits */

import type { TaskEditData, HabitEditData } from "./sidebar";

export interface Task {
    id: number;
    name: string;
    start_time: string | null;
    end_time: string | null;
    start_date: string | null;
    end_date: string | null;
    repeat_days: string[];
    log_date: string | null;
}

export interface Habit {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    repeat_days: string[];
}

export interface Goal {
    id: number;
    name: string;
    description: string | null;
    category: string;
    color: string;
    target_date: string;
    start_date: string;
    created_at: string;
    tasks: Task[];
    habits: Habit[];
    progress: number;
}

/** Payload for creating/updating a goal */
export interface GoalData {
    name: string;
    description: string | null;
    category: string;
    color: string;
    start_date: string;
    target_date: string;
}

/** Row returned from the goals table */
export interface GoalRow {
    id: number;
    name: string;
    description: string | null;
    category: string;
    color: string;
    start_date: string;
    target_date: string;
    status?: string;
    created_at?: string;
}

/** Task or habit not assigned to any goal */
export interface UnassignedItem {
    id: number;
    name: string;
    repeat_days: string[];
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    type: "task" | "habit";
    is_repeating: boolean;
}

/** Extended Goal with computed fields for UI display */
export interface GoalWithDetails {
    id: number;
    name: string;
    description: string | null;
    category: string;
    status?: string;
    color?: string;
    target_date: string;
    start_date?: string;
    created_at?: string;
    tasks: Task[];
    habits: Habit[];
    progress: number;
    totalLogs: number;
    taskLogsMap: Map<number, { completed: boolean; date: string; start_time?: string | null; end_time?: string | null }[]>;
    habitLogsMap: Map<number, { completed: boolean; date: string }[]>;
}

/** Formatted task for UI rendering */
export interface FormattedTask {
    title: string;
    days?: string;
    time?: string;
    completed?: boolean;
    editData: TaskEditData;
}

/** Formatted habit for UI rendering */
export interface FormattedHabit {
    title: string;
    days?: string;
    completed?: boolean;
    editData: HabitEditData;
}

/** Formatted goal ready for rendering */
export interface FormattedGoal extends GoalWithDetails {
    formattedTasks: FormattedTask[];
    formattedHabits: FormattedHabit[];
    categoryName: string;
    formattedDate: string;
}
