import { createClient } from "@/lib/supabase/client";
import type { CreateHabitParams, UpdateHabitParams } from "@/types/habit";
import { getTodayDateString } from "@/utils/dateUtils";

export interface DeleteResult {
    success: boolean;
    error?: string;
}

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

/** Delete a habit and its related data from today onwards */
export async function deleteHabitWithFutureLogs(
    habitId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        const today = getTodayDateString();

        const { error: logsErr } = await supabase
            .from("habit_logs")
            .delete()
            .eq("habit_id", habitId)
            .gte("date", today);
        if (logsErr) throw logsErr;

        const { error: rdErr } = await supabase
            .from("habit_repeat_days")
            .delete()
            .eq("habit_id", habitId);
        if (rdErr) throw rdErr;

        const { error: habitErr } = await supabase
            .from("habits")
            .delete()
            .eq("id", habitId);
        if (habitErr) throw habitErr;

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting habit:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}

/** Delete a habit and ALL its related data completely */
export async function deleteHabitCompletely(
    habitId: number,
): Promise<DeleteResult> {
    try {
        const supabase = createClient();
        await supabase.from("habit_logs").delete().eq("habit_id", habitId);
        await supabase.from("habit_repeat_days").delete().eq("habit_id", habitId);
        const { error } = await supabase.from("habits").delete().eq("id", habitId);
        if (error) throw error;
        return { success: true };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}

/** Delete a habit log; if it's the last log, also delete the habit itself */
export async function deleteHabitLog(logId: number): Promise<DeleteResult> {
    try {
        const supabase = createClient();

        const { data: logData, error: fetchErr } = await supabase
            .from("habit_logs")
            .select("habit_id")
            .eq("id", logId)
            .single();
        if (fetchErr || !logData)
            throw new Error(fetchErr?.message || "Log not found");

        const habitId = logData.habit_id;

        const { count, error: countErr } = await supabase
            .from("habit_logs")
            .select("*", { count: "exact", head: true })
            .eq("habit_id", habitId);
        if (countErr) throw countErr;

        const { error: delErr } = await supabase
            .from("habit_logs")
            .delete()
            .eq("id", logId);
        if (delErr) throw delErr;

        if (count === 1) {
            await supabase.from("habit_repeat_days").delete().eq("habit_id", habitId);
            await supabase.from("habits").delete().eq("id", habitId);
        }

        return { success: true };
    } catch (error: unknown) {
        console.error("Error deleting habit log:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unknown error occurred",
        };
    }
}
