export interface TaskEditData {
    id: number;
    goal_id: number | null;
    name: string;
    start_date: string | null;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    repeat_days: string[];
    is_repeating: boolean;
    edit_date?: string; // For one-time tasks or specific date being edited
    log_id?: number; // For updating the specific task_log
}

export interface HabitEditData {
    id: number;
    goal_id: number | null;
    name: string;
    start_date: string;
    end_date: string;
    repeat_days: string[];
    edit_date?: string;
    log_id?: number;
}

export type SidebarView =
    | { type: "closed" }
    | { type: "day-info"; date: Date }
    | { type: "daily-analytics" }
    | { type: "weekly-stats" }
    | { type: "add-task" }
    | { type: "add-habit" }
    | { type: "edit-task"; data: TaskEditData }
    | { type: "edit-habit"; data: HabitEditData };
