export type CalendarEvent = {
  id: number; // This is the log_id for checkbox updates
  title: string;
  date: string;
  time?: string;
  color?: string;
  completed: boolean;
  type: "task" | "habit";
  // Additional fields for editing (populated by RPC function)
  task_id?: number | null; // The actual task ID
  habit_id?: number | null; // The actual habit ID
  goal_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  repeat_days?: string[];
  log_id?: number; // For task_logs/habit_logs (same as id)
};

export type CalendarEventsMap = Record<string, CalendarEvent[]>;