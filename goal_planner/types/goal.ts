/** Shared type definitions for goals, tasks, and habits */

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
