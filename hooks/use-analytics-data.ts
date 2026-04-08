/**
 * Centralized analytics hook.
 * Provides data for /stats and the sidebar.
 * Both consumers use this hook — do not duplicate fetch logic.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUser } from "@/lib/services/auth-service";

export type AnalyticsPeriod = "weekly" | "monthly" | "all";

export interface GoalAnalytics {
    id: number;
    name: string;
    color: string;
    category: string;
    progress: number;
    completedLogs: number;
    totalLogs: number;
}

/** Per-day activity — tasks and habits separately for the stacked chart */
export interface DayActivity {
    date: string;
    tasks: number;
    habits: number;
}

export interface AnalyticsResult {
    tasksCompleted: number;
    tasksPending: number;
    habitsCompleted: number;
    habitsPending: number;
    goalsProgress: GoalAnalytics[];
    dailyActivity: DayActivity[];
    streak: { current: number; best: number };
    periodRange: { start: string; end: string } | null;
    periodLabel: string;
    loading: boolean;
    error: string | null;
}
function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getPeriodRange(
    period: AnalyticsPeriod,
    refYear: number,
    refMonth: number,
): { start: string; end: string } | null {
    if (period === "all") return null;

    if (period === "weekly") {
        const today = new Date();
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { start: toDateStr(monday), end: toDateStr(sunday) };
    }

    // monthly — uses refYear/refMonth as reference
    const start = new Date(refYear, refMonth, 1);
    const end = new Date(refYear, refMonth + 1, 0);
    return { start: toDateStr(start), end: toDateStr(end) };
}

function getPeriodLabel(
    period: AnalyticsPeriod,
    refYear: number,
    refMonth: number,
): string {
    if (period === "all") return "All time";
    if (period === "weekly") {
        const today = new Date();
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        return `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    return new Date(refYear, refMonth).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

/** Builds the array of days for the chart based on the selected period */
function buildDayRange(
    period: AnalyticsPeriod,
    refYear: number,
    refMonth: number,
): string[] {
    const today = new Date();
    const todayStr = toDateStr(today);

    if (period === "weekly") {
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return toDateStr(d);
        });
    }

    if (period === "monthly") {
        const daysInMonth = new Date(refYear, refMonth + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
            const d = new Date(refYear, refMonth, i + 1);
            return toDateStr(d);
        }).filter((d) => d <= todayStr);
    }

    // all — last 30 days
    return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (29 - i));
        return toDateStr(d);
    });
}

// ===== HOOK =====

export function useAnalyticsData(
    period: AnalyticsPeriod,
    referenceYear?: number,
    referenceMonth?: number,
): AnalyticsResult {
    const now = new Date();
    const refYear = referenceYear ?? now.getFullYear();
    const refMonth = referenceMonth ?? now.getMonth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<Omit<AnalyticsResult, "loading" | "error">>({
        tasksCompleted: 0,
        tasksPending: 0,
        habitsCompleted: 0,
        habitsPending: 0,
        goalsProgress: [],
        dailyActivity: [],
        streak: { current: 0, best: 0 },
        periodRange: null,
        periodLabel: "",
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const user = await getUser();
            if (!user) { setLoading(false); return; }

            const supabase = createClient();
            const today = toDateStr(new Date());
            const range = getPeriodRange(period, refYear, refMonth);
            const label = getPeriodLabel(period, refYear, refMonth);

            // ── Goals ──────────────────────────────────────────────────────
            const { data: goalsData, error: goalsErr } = await supabase
                .from("goals")
                .select("id, name, color, category")
                .eq("user_id", user.id)
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (goalsErr) throw goalsErr;
            const goalsList = goalsData || [];
            const goalIds = goalsList.map((g: { id: number }) => g.id);

            if (goalIds.length === 0) {
                setResult({
                    tasksCompleted: 0, tasksPending: 0,
                    habitsCompleted: 0, habitsPending: 0,
                    goalsProgress: [], dailyActivity: [],
                    streak: { current: 0, best: 0 },
                    periodRange: range,
                    periodLabel: label,
                });
                setLoading(false);
                return;
            }

            // ── Tasks & Habits under those goals ───────────────────────────
            const [{ data: tasksData }, { data: habitsData }] = await Promise.all([
                supabase.from("tasks").select("id, goal_id").in("goal_id", goalIds).is("deleted_at", null),
                supabase.from("habits").select("id, goal_id").in("goal_id", goalIds).is("deleted_at", null),
            ]);

            const taskIds = (tasksData || []).map((t: { id: number }) => t.id);
            const habitIds = (habitsData || []).map((h: { id: number }) => h.id);

            // ── Period logs (for period stats) ─────────────────────────────
            // Fetch ALL logs for the period (including future days pre-generated by the RPC)
            // so the donut denominator equals the total scheduled events in the period.
            // "completed" is filtered client-side: completed=true AND date <= today.
            // "pending" = total for period − completed (includes future days not yet due).
            // For "all" there is no fixed range, so we cap at today.
            let taskLogsQ = supabase
                .from("task_logs").select("task_id, completed, date")
                .in("task_id", taskIds.length > 0 ? taskIds : [-1]);
            let habitLogsQ = supabase
                .from("habit_logs").select("habit_id, completed, date")
                .in("habit_id", habitIds.length > 0 ? habitIds : [-1]);

            if (range) {
                taskLogsQ = taskLogsQ.gte("date", range.start).lte("date", range.end);
                habitLogsQ = habitLogsQ.gte("date", range.start).lte("date", range.end);
            } else {
                // "all" — all logs up to today (no future range)
                taskLogsQ = taskLogsQ.lte("date", today);
                habitLogsQ = habitLogsQ.lte("date", today);
            }

            // ── All-time logs (for goal progress) ──────────────────────────
            const [
                { data: periodTaskLogs },
                { data: periodHabitLogs },
                { data: allTaskLogs },
                { data: allHabitLogs },
            ] = await Promise.all([
                taskLogsQ,
                habitLogsQ,
                taskIds.length > 0
                    ? supabase.from("task_logs").select("task_id, completed").in("task_id", taskIds).lte("date", today)
                    : Promise.resolve({ data: [] }),
                habitIds.length > 0
                    ? supabase.from("habit_logs").select("habit_id, completed").in("habit_id", habitIds).lte("date", today)
                    : Promise.resolve({ data: [] }),
            ]);

            // ── Period stats ────────────────────────────────────────────────
            // tLogs/hLogs include future pre-generated days (completed=false).
            // "completed" = marked as done AND already past (date <= today).
            // "pending"   = total for period − completed (includes future not-yet-due days).
            const tLogs = periodTaskLogs || [];
            const hLogs = periodHabitLogs || [];
            const tasksCompleted  = tLogs.filter((l: { completed: boolean; date: string }) => l.completed && l.date <= today).length;
            const tasksPending    = tLogs.length - tasksCompleted;
            const habitsCompleted = hLogs.filter((l: { completed: boolean; date: string }) => l.completed && l.date <= today).length;
            const habitsPending   = hLogs.length - habitsCompleted;

            // ── Daily activity (for stacked chart) ─────────────────────────
            // Only days <= today (tLogs may include future days, ignored here)
            const taskActivityMap: Record<string, number> = {};
            const habitActivityMap: Record<string, number> = {};
            tLogs.forEach((l: { completed: boolean; date: string }) => {
                if (l.completed && l.date <= today) taskActivityMap[l.date] = (taskActivityMap[l.date] || 0) + 1;
            });
            hLogs.forEach((l: { completed: boolean; date: string }) => {
                if (l.completed && l.date <= today) habitActivityMap[l.date] = (habitActivityMap[l.date] || 0) + 1;
            });

            const dayRange = buildDayRange(period, refYear, refMonth);
            const dailyActivity: DayActivity[] = dayRange.map((date) => ({
                date,
                tasks: taskActivityMap[date] || 0,
                habits: habitActivityMap[date] || 0,
            }));

            // ── Goal progress ───────────────────────────────────────────────
            const taskGoalMap = new Map<number, number>();
            (tasksData || []).forEach((t: { id: number; goal_id: number }) => taskGoalMap.set(t.id, t.goal_id));
            const habitGoalMap = new Map<number, number>();
            (habitsData || []).forEach((h: { id: number; goal_id: number }) => habitGoalMap.set(h.id, h.goal_id));

            const goalStats = new Map<number, { completed: number; total: number }>();
            goalsList.forEach((g: { id: number }) => goalStats.set(g.id, { completed: 0, total: 0 }));

            (allTaskLogs || []).forEach((l: { task_id: number; completed: boolean }) => {
                const gid = taskGoalMap.get(l.task_id);
                if (gid !== undefined) {
                    const s = goalStats.get(gid)!;
                    s.total++;
                    if (l.completed) s.completed++;
                }
            });
            (allHabitLogs || []).forEach((l: { habit_id: number; completed: boolean }) => {
                const gid = habitGoalMap.get(l.habit_id);
                if (gid !== undefined) {
                    const s = goalStats.get(gid)!;
                    s.total++;
                    if (l.completed) s.completed++;
                }
            });

            const goalsProgress: GoalAnalytics[] = goalsList.map(
                (g: { id: number; name: string; color: string; category: string }) => {
                    const s = goalStats.get(g.id) || { completed: 0, total: 0 };
                    return {
                        id: g.id,
                        name: g.name,
                        color: g.color,
                        category: g.category,
                        progress: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
                        completedLogs: s.completed,
                        totalLogs: s.total,
                    };
                },
            );

            // ── Streak (last 90 days, by user_id) ──────────────────────────
            const ninetyAgo = new Date();
            ninetyAgo.setDate(ninetyAgo.getDate() - 89);
            const windowStart = toDateStr(ninetyAgo);

            const [{ data: streakTasks }, { data: streakHabits }] = await Promise.all([
                supabase.from("task_logs").select("date").eq("user_id", user.id)
                    .eq("completed", true).gte("date", windowStart).lte("date", today),
                supabase.from("habit_logs").select("date").eq("user_id", user.id)
                    .eq("completed", true).gte("date", windowStart).lte("date", today),
            ]);

            const completedDates = new Set<string>();
            (streakTasks || []).forEach((l: { date: string }) => completedDates.add(l.date));
            (streakHabits || []).forEach((l: { date: string }) => completedDates.add(l.date));

            const todayDate = new Date();
            let currentStreak = 0;
            let skippedToday = false;
            for (let i = 0; i < 90; i++) {
                const d = new Date(todayDate);
                d.setDate(todayDate.getDate() - i);
                const ds = toDateStr(d);
                if (completedDates.has(ds)) {
                    currentStreak++;
                } else if (i === 0 && !skippedToday) {
                    skippedToday = true;
                    continue;
                } else {
                    break;
                }
            }

            let bestStreak = currentStreak;
            let tempStreak = 0;
            for (let i = 89; i >= 0; i--) {
                const d = new Date(todayDate);
                d.setDate(todayDate.getDate() - i);
                if (completedDates.has(toDateStr(d))) {
                    tempStreak++;
                    if (tempStreak > bestStreak) bestStreak = tempStreak;
                } else {
                    tempStreak = 0;
                }
            }

            setResult({
                tasksCompleted, tasksPending,
                habitsCompleted, habitsPending,
                goalsProgress, dailyActivity,
                streak: { current: currentStreak, best: bestStreak },
                periodRange: range,
                periodLabel: label,
            });
        } catch (err) {
            console.error("useAnalyticsData error:", err);
            setError("Failed to load analytics.");
        } finally {
            setLoading(false);
        }
    }, [period, refYear, refMonth]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { ...result, loading, error };
}
