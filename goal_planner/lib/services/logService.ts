import { createClient } from "@/lib/supabase/client";
import type { UpdateTaskLogData } from "@/types/log";

/** Update a task log entry */
export async function updateTaskLog(
    logId: number,
    data: UpdateTaskLogData,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from("task_logs")
        .update({
            date: data.date,
            start_time: data.start_time,
            end_time: data.end_time,
        })
        .eq("id", logId);

    if (error) throw error;
}

/** Update a habit log entry */
export async function updateHabitLog(
    logId: number,
    date: string,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from("habit_logs")
        .update({ date })
        .eq("id", logId);

    if (error) throw error;
}
