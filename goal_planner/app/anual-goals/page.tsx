"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Top from "@/components/Layout/Top/Top";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import Modal from "@/components/ui/Modal/Modal";
import { createClient } from "@/lib/supabase/client";
import { deleteGoalWithRelatedData } from "@/utils/deleteGoal";
import {
    deleteTaskWithFutureLogs,
    deleteHabitWithFutureLogs,
} from "@/utils/deleteTaskHabit";
import {
    formatRepeatDays,
    formatTime,
    formatDateShort,
    formatTargetDate,
    capitalizeFirst,
} from "@/utils/formatUtils";
import type { TaskEditData, HabitEditData } from "@/types/sidebar";
import type { Task, Habit, Goal as BaseGoal } from "@/types/goal";

// Extend base Goal with page-specific fields
interface Goal extends Omit<BaseGoal, "start_date" | "created_at" | "color"> {
    status: string;
    color?: string;
    start_date?: string;
    created_at?: string;
    totalLogs: number;
    taskLogsMap: Map<number, any[]>;
    habitLogsMap: Map<number, any[]>;
}

// ===== DATA FETCHING =====
/**
 * Fetches all goals with associated tasks, habits, and logs using optimized batch queries.
 * Builds lookup maps for O(1) access and calculates progress per goal.
 */
async function fetchAllGoalsData(supabase: any, userId: string) {
    const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (goalsError || !goalsData || goalsData.length === 0) return [];

    const goalIds = goalsData.map((g: any) => g.id);

    const [{ data: allTasks }, { data: allHabits }] = await Promise.all([
        supabase
            .from("tasks")
            .select("id, goal_id, name, start_date, end_date")
            .in("goal_id", goalIds)
            .is("deleted_at", null),
        supabase
            .from("habits")
            .select("id, goal_id, name, start_date, end_date")
            .in("goal_id", goalIds)
            .is("deleted_at", null),
    ]);

    const taskIds = allTasks?.map((t: any) => t.id) || [];
    const habitIds = allHabits?.map((h: any) => h.id) || [];

    const [
        { data: allTaskRepeatDays },
        { data: allHabitRepeatDays },
        { data: allTaskLogs },
        { data: allHabitLogs },
    ] = await Promise.all([
        taskIds.length > 0
            ? supabase
                  .from("task_repeat_days")
                  .select("task_id, day")
                  .in("task_id", taskIds)
            : Promise.resolve({ data: [] }),
        habitIds.length > 0
            ? supabase
                  .from("habit_repeat_days")
                  .select("habit_id, day")
                  .in("habit_id", habitIds)
            : Promise.resolve({ data: [] }),
        taskIds.length > 0
            ? supabase
                  .from("task_logs")
                  .select("task_id, completed, date")
                  .in("task_id", taskIds)
            : Promise.resolve({ data: [] }),
        habitIds.length > 0
            ? supabase
                  .from("habit_logs")
                  .select("habit_id, completed, date")
                  .in("habit_id", habitIds)
            : Promise.resolve({ data: [] }),
    ]);

    // Build lookup maps
    const tasksByGoalId = new Map<number, any[]>();
    const habitsByGoalId = new Map<number, any[]>();
    const taskRepeatDaysMap = new Map<number, string[]>();
    const habitRepeatDaysMap = new Map<number, string[]>();
    const taskLogsMap = new Map<number, any[]>();
    const habitLogsMap = new Map<number, any[]>();

    allTasks?.forEach((t: any) => {
        if (!tasksByGoalId.has(t.goal_id)) tasksByGoalId.set(t.goal_id, []);
        tasksByGoalId.get(t.goal_id)!.push(t);
    });

    allHabits?.forEach((h: any) => {
        if (!habitsByGoalId.has(h.goal_id)) habitsByGoalId.set(h.goal_id, []);
        habitsByGoalId.get(h.goal_id)!.push(h);
    });

    allTaskRepeatDays?.forEach((r: any) => {
        if (!taskRepeatDaysMap.has(r.task_id))
            taskRepeatDaysMap.set(r.task_id, []);
        taskRepeatDaysMap.get(r.task_id)!.push(r.day);
    });

    allHabitRepeatDays?.forEach((r: any) => {
        if (!habitRepeatDaysMap.has(r.habit_id))
            habitRepeatDaysMap.set(r.habit_id, []);
        habitRepeatDaysMap.get(r.habit_id)!.push(r.day);
    });

    allTaskLogs?.forEach((l: any) => {
        if (!taskLogsMap.has(l.task_id)) taskLogsMap.set(l.task_id, []);
        taskLogsMap.get(l.task_id)!.push(l);
    });

    allHabitLogs?.forEach((l: any) => {
        if (!habitLogsMap.has(l.habit_id)) habitLogsMap.set(l.habit_id, []);
        habitLogsMap.get(l.habit_id)!.push(l);
    });

    return goalsData.map((goal: any) => {
        const goalTasks = tasksByGoalId.get(goal.id) || [];
        const goalHabits = habitsByGoalId.get(goal.id) || [];

        const tasks: Task[] = goalTasks.map((task: any) => {
            const repeatDays = taskRepeatDaysMap.get(task.id) || [];
            let logDate = null;
            if (!task.start_date && !task.end_date) {
                const logs = taskLogsMap.get(task.id) || [];
                logDate = logs.length > 0 ? logs[0].date : null;
            }
            return {
                id: task.id,
                name: task.name,
                start_time: null,
                start_date: task.start_date,
                end_date: task.end_date,
                repeat_days: repeatDays,
                log_date: logDate,
            };
        });

        const habits: Habit[] = goalHabits.map((habit: any) => ({
            id: habit.id,
            name: habit.name,
            start_date: habit.start_date || "",
            end_date: habit.end_date || "",
            repeat_days: habitRepeatDaysMap.get(habit.id) || [],
        }));

        let totalLogs = 0;
        let completedLogs = 0;

        tasks.forEach((task) => {
            const logs = taskLogsMap.get(task.id) || [];
            totalLogs += logs.length;
            completedLogs += logs.filter((l: any) => l.completed).length;
        });

        habits.forEach((habit) => {
            const logs = habitLogsMap.get(habit.id) || [];
            totalLogs += logs.length;
            completedLogs += logs.filter((l: any) => l.completed).length;
        });

        const progress =
            totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

        return {
            id: goal.id,
            name: goal.name,
            description: goal.description,
            category: goal.category,
            status: goal.status,
            target_date: goal.target_date,
            tasks,
            habits,
            progress,
            totalLogs,
            taskLogsMap,
            habitLogsMap,
        };
    });
}

/**
 * Calculate overall year progress as a weighted average of each goal's progress.
 * Weight is based on the number of logs, making goals with more activity
 * have a proportionally larger impact on the overall percentage.
 */
function calculateYearProgress(goals: Goal[]): number {
    const currentYear = new Date().getFullYear();
    const yearGoals = goals.filter(
        (g) => new Date(g.target_date).getFullYear() === currentYear,
    );

    if (yearGoals.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    yearGoals.forEach((goal) => {
        if (goal.totalLogs > 0) {
            weightedSum += goal.progress * goal.totalLogs;
            totalWeight += goal.totalLogs;
        }
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// ===== FILTER OPTIONS =====
const FILTERS = [
    { id: "all" as const, label: "All" },
    { id: "active" as const, label: "Active" },
    { id: "completed" as const, label: "Completed" },
] as const;

// ===== COMPONENT =====
export default function AnualGoalsPage() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<
        "all" | "active" | "completed"
    >("all");
    const [overallProgress, setOverallProgress] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchGoalsData = useCallback(async () => {
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const goalsWithDetails = await fetchAllGoalsData(supabase, user.id);
            setGoals(goalsWithDetails);
            setOverallProgress(calculateYearProgress(goalsWithDetails));
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGoalsData();
    }, [fetchGoalsData]);

    // ===== GOAL DELETION =====
    const handleDeleteClick = useCallback(
        (goalId: number, goalName: string) => {
            setGoalToDelete({ id: goalId, name: goalName });
            setIsDeleteModalOpen(true);
        },
        [],
    );

    const handleConfirmDelete = useCallback(async () => {
        if (!goalToDelete) return;
        setIsDeleting(true);
        const result = await deleteGoalWithRelatedData(goalToDelete.id);
        setIsDeleting(false);

        if (result.success) {
            setIsDeleteModalOpen(false);
            setGoalToDelete(null);
            await fetchGoalsData();
        } else {
            alert(`Failed to delete goal: ${result.error}`);
        }
    }, [goalToDelete, fetchGoalsData]);

    const handleCancelDelete = useCallback(() => {
        setIsDeleteModalOpen(false);
        setGoalToDelete(null);
    }, []);

    // ===== TASK/HABIT DELETION =====
    const handleTaskDelete = async (goalIndex: number, taskIndex: number) => {
        const goal = formattedGoals[goalIndex];
        const taskId = goals.find((g) => g.id === goal.id)?.tasks[taskIndex]
            ?.id;
        if (!taskId) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.formattedTasks[taskIndex].title}"? This will delete the task and all its logs from today onwards.`,
        );
        if (!confirmed) return;

        const result = await deleteTaskWithFutureLogs(taskId);
        if (result.success) await fetchGoalsData();
        else alert(`Failed to delete task: ${result.error}`);
    };

    const handleHabitDelete = async (goalIndex: number, habitIndex: number) => {
        const goal = formattedGoals[goalIndex];
        const habitId = goals.find((g) => g.id === goal.id)?.habits[habitIndex]
            ?.id;
        if (!habitId) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.formattedHabits[habitIndex].title}"? This will delete the habit and all its logs from today onwards.`,
        );
        if (!confirmed) return;

        const result = await deleteHabitWithFutureLogs(habitId);
        if (result.success) await fetchGoalsData();
        else alert(`Failed to delete habit: ${result.error}`);
    };

    // ===== FILTERED & FORMATTED DATA =====
    const filteredGoals = useMemo(() => {
        const filtered = goals.filter((g) => {
            if (selectedFilter === "all") return true;
            const isCompleted = g.progress >= 100;
            return selectedFilter === "completed" ? isCompleted : !isCompleted;
        });

        // Sort: incomplete goals first, completed goals last
        return filtered.sort((a, b) => {
            const aCompleted = a.progress >= 100 ? 1 : 0;
            const bCompleted = b.progress >= 100 ? 1 : 0;
            return aCompleted - bCompleted;
        });
    }, [goals, selectedFilter]);

    const { activeCount, completedCount } = useMemo(
        () => ({
            activeCount: goals.filter((g) => g.progress < 100).length,
            completedCount: goals.filter((g) => g.progress >= 100).length,
        }),
        [goals],
    );

    const formattedGoals = useMemo(
        () =>
            filteredGoals.map((goal) => {
                const formattedTasks = goal.tasks.map((task) => {
                    let days: string | undefined;
                    if (!task.start_date && !task.end_date && task.log_date) {
                        days = formatDateShort(task.log_date);
                    } else if (task.repeat_days.length > 0) {
                        days = formatRepeatDays(task.repeat_days);
                    }

                    // Check if all logs are completed
                    const taskLogs = goal.taskLogsMap.get(task.id) || [];
                    const allCompleted =
                        taskLogs.length > 0 &&
                        taskLogs.every((l: any) => l.completed);

                    const editData: TaskEditData = {
                        id: task.id,
                        goal_id: goal.id,
                        name: task.name,
                        start_date: task.start_date,
                        end_date: task.end_date,
                        start_time: null,
                        end_time: null,
                        repeat_days: task.repeat_days,
                        is_repeating: task.repeat_days.length > 0,
                        edit_date: task.log_date ?? undefined,
                    };

                    return {
                        title: task.name,
                        days,
                        time: formatTime(task.start_time),
                        completed: allCompleted,
                        editData,
                    };
                });

                const formattedHabits = goal.habits.map((habit) => {
                    const habitLogs = goal.habitLogsMap.get(habit.id) || [];
                    const allCompleted =
                        habitLogs.length > 0 &&
                        habitLogs.every((l: any) => l.completed);

                    const editData: HabitEditData = {
                        id: habit.id,
                        goal_id: goal.id,
                        name: habit.name,
                        start_date: habit.start_date,
                        end_date: habit.end_date,
                        repeat_days: habit.repeat_days,
                    };

                    return {
                        title: habit.name,
                        days: formatRepeatDays(habit.repeat_days),
                        completed: allCompleted,
                        editData,
                    };
                });

                return {
                    ...goal,
                    formattedTasks,
                    formattedHabits,
                    categoryName: capitalizeFirst(goal.category),
                    formattedDate: formatTargetDate(goal.target_date),
                };
            }),
        [filteredGoals],
    );

    const handleNewGoal = useCallback(() => router.push("/new-goal"), [router]);

    // ===== RENDER =====
    return (
        <div>
            <Navbar />
            <div className="ml-20 mr-7 p-6">
                <Top
                    title="My Goals"
                    buttons={[{ text: "New Goal", onClick: handleNewGoal }]}
                />

                {/* Statistics Bar */}
                <div className="h-14 w-full bg-modal-bg border font-medium text-white-pearl border-input-bg rounded-3xl flex items-center px-6 gap-10 whitespace-nowrap">
                    <span>{activeCount} Active</span>
                    <span>|</span>
                    <span>{completedCount} Completed</span>
                    <span>|</span>
                    <span>
                        Overall Year Progress:
                        <span className="text-vibrant-orange">
                            {" "}
                            {overallProgress}%
                        </span>
                    </span>
                    <div className="w-1/2 h-2 bg-input-bg rounded-full overflow-hidden">
                        <div
                            className="h-full bg-vibrant-orange transition-all"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="h-16 w-full font-medium text-white-pearl flex items-center px-6 gap-10 my-8 border-b-2 pb-6 border-input-bg">
                    {FILTERS.map((filter) => (
                        <span
                            key={filter.id}
                            className={`cursor-pointer border-b-2 pb-1 transition-colors duration-200 ${
                                selectedFilter === filter.id
                                    ? "text-vibrant-orange border-vibrant-orange"
                                    : "border-modal-bg hover:text-vibrant-orange hover:border-vibrant-orange"
                            }`}
                            onClick={() => setSelectedFilter(filter.id)}
                        >
                            {filter.label}
                        </span>
                    ))}
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-white-pearl text-center py-8">
                            Loading goals...
                        </div>
                    ) : formattedGoals.length === 0 ? (
                        <div className="text-white-pearl text-center py-8">
                            No goals found. Create your first goal!
                        </div>
                    ) : (
                        formattedGoals.map((goal, goalIndex) => (
                            <GoalCard
                                key={goal.id}
                                goalId={goal.id}
                                title={goal.name}
                                description={
                                    goal.description || goal.categoryName
                                }
                                progress={goal.progress}
                                targetDate={goal.formattedDate}
                                category={goal.categoryName}
                                tasks={goal.formattedTasks}
                                habits={goal.formattedHabits}
                                onTaskAdd={() => fetchGoalsData()}
                                onHabitAdd={() => fetchGoalsData()}
                                onTaskDelete={(taskIndex) =>
                                    handleTaskDelete(goalIndex, taskIndex)
                                }
                                onHabitDelete={(habitIndex) =>
                                    handleHabitDelete(goalIndex, habitIndex)
                                }
                                onEdit={() =>
                                    router.push(`/edit-goal?id=${goal.id}`)
                                }
                                onDelete={() =>
                                    handleDeleteClick(goal.id, goal.name)
                                }
                            />
                        ))
                    )}
                </div>
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                title="Delete Goal?"
                message={
                    <>
                        Are you sure you want to delete{" "}
                        <strong className="text-white-pearl">
                            {goalToDelete?.name}
                        </strong>
                        ? This will permanently delete the goal and all
                        associated tasks, habits, and their logs. This action
                        cannot be undone.
                    </>
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                onClose={handleCancelDelete}
                isLoading={isDeleting}
                maxWidth="md"
            />
        </div>
    );
}
