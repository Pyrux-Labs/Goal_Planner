import { createClient } from "@/lib/supabase/client";
import type { CreateHabitParams, UpdateHabitParams } from "@/types/habit";

/** Create a habit with repeat days via RPC */
export async function createHabitWithRepeatDays(
    params: CreateHabitParams,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc("create_habit_with_repeat_days", {
        p_goal_id: params.goalId,
        p_name: params.name,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_repeat_days: params.repeatDays,
    });
    if (error?.message) throw error;
}

/** Update a habit with repeat days via RPC */
export async function updateHabitWithRepeatDays(
    params: UpdateHabitParams,
): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc("update_habit_with_repeat_days", {
        p_habit_id: params.habitId,
        p_goal_id: params.goalId,
        p_name: params.name,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_repeat_days: params.repeatDays,
    });
    if (error?.message) throw error;
}
