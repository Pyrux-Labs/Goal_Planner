import { createClient } from "@/lib/supabase/client";

export interface CreateTaskParams {
    goalId: number | null;
    name: string;
    startDate: string | null;
    endDate: string | null;
    startTime: string | null;
    endTime: string | null;
    isOneTime: boolean;
    oneTimeDate: string | null;
    repeatDays: string[];
}

export interface UpdateTaskParams {
    taskId: number;
    goalId: number | null;
    name: string;
    startDate: string | null;
    endDate: string | null;
    startTime: string | null;
    endTime: string | null;
    repeatDays: string[];
}

/** Create a task with repeat days via RPC */
export async function createTaskWithRepeatDays(
    params: CreateTaskParams,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc("create_task_with_repeat_days", {
        p_goal_id: params.goalId,
        p_name: params.name,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_start_time: params.startTime,
        p_end_time: params.endTime,
        p_is_one_time: params.isOneTime,
        p_one_time_date: params.oneTimeDate,
        p_repeat_days: params.repeatDays,
    });
    if (error?.message) throw error;
}

/** Update a task with repeat days via RPC */
export async function updateTaskWithRepeatDays(
    params: UpdateTaskParams,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_task_with_repeat_days", {
        p_task_id: params.taskId,
        p_goal_id: params.goalId,
        p_name: params.name,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_start_time: params.startTime,
        p_end_time: params.endTime,
        p_repeat_days: params.repeatDays,
    });
    if (error?.message) throw error;
}
