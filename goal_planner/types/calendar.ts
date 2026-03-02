export type CalendarEvent = {
    id: number; // This is the log_id for checkbox updates
    title: string;
    date: string;
    color?: string;
    completed: boolean;
    type: "task" | "habit";
    task_id?: number | null;
    habit_id?: number | null;
    goal_id?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    repeat_days?: string[];
    log_id?: number; // Same as id, kept for explicit edit-flow clarity
};

export type CalendarEventsMap = Record<string, CalendarEvent[]>;
