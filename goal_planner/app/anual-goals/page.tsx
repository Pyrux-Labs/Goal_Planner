"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Top from "@/components/Layout/Top/Top";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import { createClient } from "@/lib/supabase/client";
import { deleteGoalWithRelatedData } from "@/utils/deleteGoal";
import {
    deleteTaskWithFutureLogs,
    deleteHabitWithFutureLogs,
} from "@/utils/deleteTaskHabit";

// ===== TYPE DEFINITIONS =====
interface Task {
    id: number;
    name: string;
    start_time: string | null;
    start_date: string | null;
    end_date: string | null;
    repeat_days: string[];
    log_date: string | null;
}

interface Habit {
    id: number;
    name: string;
    repeat_days: string[];
}

interface Goal {
    id: number;
    name: string;
    description: string | null;
    category: string;
    status: string;
    target_date: string;
    tasks: Task[];
    habits: Habit[];
    progress: number;
    totalLogs: number;
}

// ===== CONSTANTS =====
const DAY_MAP: { [key: string]: string } = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
};

// ===== UTILITY FUNCTIONS =====
const formatRepeatDays = (days: string[]): string | undefined => {
    if (days.length === 7) return "Everyday";
    if (days.length === 0) return undefined;
    return days.map((day) => DAY_MAP[day.toLowerCase()] || day).join(", ");
};

const formatTime = (time: string | null): string | undefined => {
    if (!time) return undefined;
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

const formatDate = (date: string | null): string | undefined => {
    if (!date) return undefined;
    const d = new Date(date);
    const day = d.getDate();
    const month = d
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
    return `${day} ${month}`;
};

const formatTargetDate = (date: string): string => {
    const targetDate = new Date(date);
    return targetDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// ===== OPTIMIZED BATCH DATA FETCHING =====
async function fetchAllGoalsDataOptimized(supabase: any, userId: string) {
    // 1. Fetch all goals
    const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (goalsError || !goalsData || goalsData.length === 0) {
        return [];
    }

    const goalIds = goalsData.map((g: any) => g.id);

    // 2. Fetch tasks and habits first to get their IDs
    const [{ data: allTasks }, { data: allHabits }] = await Promise.all([
        supabase
            .from("tasks")
            .select("id, goal_id, name, start_date, end_date")
            .in("goal_id", goalIds)
            .is("deleted_at", null),
        supabase
            .from("habits")
            .select("id, goal_id, name")
            .in("goal_id", goalIds)
            .is("deleted_at", null),
    ]);

    // Extract IDs for batch queries
    const taskIds = allTasks?.map((t: any) => t.id) || [];
    const habitIds = allHabits?.map((h: any) => h.id) || [];

    // 3. Batch fetch all related data in parallel using extracted IDs
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
                  .select("habit_id, completed")
                  .in("habit_id", habitIds)
            : Promise.resolve({ data: [] }),
    ]);

    // 4. Build lookup maps for O(1) access
    const tasksByGoalId = new Map<number, any[]>();
    const habitsByGoalId = new Map<number, any[]>();
    const taskRepeatDaysMap = new Map<number, string[]>();
    const habitRepeatDaysMap = new Map<number, string[]>();
    const taskLogsMap = new Map<number, any[]>();
    const habitLogsMap = new Map<number, any[]>();

    // Index tasks by goal_id
    allTasks?.forEach((task: any) => {
        if (!tasksByGoalId.has(task.goal_id)) {
            tasksByGoalId.set(task.goal_id, []);
        }
        tasksByGoalId.get(task.goal_id)!.push(task);
    });

    // Index habits by goal_id
    allHabits?.forEach((habit: any) => {
        if (!habitsByGoalId.has(habit.goal_id)) {
            habitsByGoalId.set(habit.goal_id, []);
        }
        habitsByGoalId.get(habit.goal_id)!.push(habit);
    });

    // Index task repeat days
    allTaskRepeatDays?.forEach((item: any) => {
        if (!taskRepeatDaysMap.has(item.task_id)) {
            taskRepeatDaysMap.set(item.task_id, []);
        }
        taskRepeatDaysMap.get(item.task_id)!.push(item.day);
    });

    // Index habit repeat days
    allHabitRepeatDays?.forEach((item: any) => {
        if (!habitRepeatDaysMap.has(item.habit_id)) {
            habitRepeatDaysMap.set(item.habit_id, []);
        }
        habitRepeatDaysMap.get(item.habit_id)!.push(item.day);
    });

    // Index task logs
    allTaskLogs?.forEach((log: any) => {
        if (!taskLogsMap.has(log.task_id)) {
            taskLogsMap.set(log.task_id, []);
        }
        taskLogsMap.get(log.task_id)!.push(log);
    });

    // Index habit logs
    allHabitLogs?.forEach((log: any) => {
        if (!habitLogsMap.has(log.habit_id)) {
            habitLogsMap.set(log.habit_id, []);
        }
        habitLogsMap.get(log.habit_id)!.push(log);
    });

    // 5. Assemble goals with all data
    return goalsData.map((goal: any) => {
        const goalTasks = tasksByGoalId.get(goal.id) || [];
        const goalHabits = habitsByGoalId.get(goal.id) || [];

        // Build tasks with repeat days and log dates
        const tasks: Task[] = goalTasks.map((task: any) => {
            const repeatDays = taskRepeatDaysMap.get(task.id) || [];
            let logDate = null;

            // For one-time tasks, get the first log date
            if (!task.start_date && !task.end_date) {
                const logs = taskLogsMap.get(task.id) || [];
                logDate = logs.length > 0 ? logs[0].date : null;
            }

            return {
                id: task.id,
                name: task.name,
                start_time: null, // Times are now stored in task_logs per occurrence
                start_date: task.start_date,
                end_date: task.end_date,
                repeat_days: repeatDays,
                log_date: logDate,
            };
        });

        // Build habits with repeat days
        const habits: Habit[] = goalHabits.map((habit: any) => ({
            id: habit.id,
            name: habit.name,
            repeat_days: habitRepeatDaysMap.get(habit.id) || [],
        }));

        // Calculate progress efficiently from indexed data
        let totalLogs = 0;
        let completedLogs = 0;

        tasks.forEach((task) => {
            const logs = taskLogsMap.get(task.id) || [];
            totalLogs += logs.length;
            completedLogs += logs.filter((log: any) => log.completed).length;
        });

        habits.forEach((habit) => {
            const logs = habitLogsMap.get(habit.id) || [];
            totalLogs += logs.length;
            completedLogs += logs.filter((log: any) => log.completed).length;
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
        };
    });
}

// Calculate overall year progress as a weighted average of each goal's progress
// Weight is based on the number of logs each goal has (more realistic percentage)
function calculateOverallYearProgressFromGoals(goals: Goal[]): number {
    const currentYear = new Date().getFullYear();

    // Filter goals by current year target_date
    const currentYearGoals = goals.filter(
        (goal) => new Date(goal.target_date).getFullYear() === currentYear,
    );

    if (currentYearGoals.length === 0) return 0;

    // Calculate weighted average based on totalLogs
    let weightedSum = 0;
    let totalWeight = 0;

    currentYearGoals.forEach((goal) => {
        weightedSum += goal.progress * goal.totalLogs;
        totalWeight += goal.totalLogs;
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

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

    useEffect(() => {
        fetchGoalsData();
    }, []);

    const fetchGoalsData = async () => {
        try {
            const supabase = createClient();

            // Get current user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch all data in optimized batch queries
            const goalsWithDetails = await fetchAllGoalsDataOptimized(
                supabase,
                user.id,
            );

            setGoals(goalsWithDetails);

            // Calculate overall year progress as weighted average of goal progress
            const yearProgress =
                calculateOverallYearProgressFromGoals(goalsWithDetails);
            setOverallProgress(yearProgress);
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (goalId: number, goalName: string) => {
        setGoalToDelete({ id: goalId, name: goalName });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!goalToDelete) return;

        setIsDeleting(true);
        const result = await deleteGoalWithRelatedData(goalToDelete.id);
        setIsDeleting(false);

        if (result.success) {
            // Close modal and refresh goals
            setIsDeleteModalOpen(false);
            setGoalToDelete(null);
            await fetchGoalsData();
        } else {
            alert(`Failed to delete goal: ${result.error}`);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setGoalToDelete(null);
    };

    const handleTaskDelete = async (goalIndex: number, taskIndex: number) => {
        const goal = formattedGoals[goalIndex];
        const taskId = goals.find((g) => g.id === goal.id)?.tasks[taskIndex]
            ?.id;

        if (!taskId) {
            console.error("Task ID not found");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.formattedTasks[taskIndex].title}"? This will delete the task and all its logs from today onwards.`,
        );

        if (!confirmed) return;

        const result = await deleteTaskWithFutureLogs(taskId);

        if (result.success) {
            await fetchGoalsData();
        } else {
            alert(`Failed to delete task: ${result.error}`);
        }
    };

    const handleHabitDelete = async (goalIndex: number, habitIndex: number) => {
        const goal = formattedGoals[goalIndex];
        const habitId = goals.find((g) => g.id === goal.id)?.habits[habitIndex]
            ?.id;

        if (!habitId) {
            console.error("Habit ID not found");
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.formattedHabits[habitIndex].title}"? This will delete the habit and all its logs from today onwards.`,
        );

        if (!confirmed) return;

        const result = await deleteHabitWithFutureLogs(habitId);

        if (result.success) {
            await fetchGoalsData();
        } else {
            alert(`Failed to delete habit: ${result.error}`);
        }
    };

    // ===== FILTERS AND STATS (MEMOIZED) =====
    const FILTERS = useMemo(
        () => [
            { id: "all" as const, label: "All" },
            { id: "active" as const, label: "Active" },
            { id: "completed" as const, label: "Completed" },
        ],
        [],
    );

    const filteredGoals = useMemo(
        () =>
            goals.filter((goal) =>
                selectedFilter === "all"
                    ? true
                    : goal.status === selectedFilter,
            ),
        [goals, selectedFilter],
    );

    const { activeCount, completedCount } = useMemo(
        () => ({
            activeCount: goals.filter((g) => g.status === "active").length,
            completedCount: goals.filter((g) => g.status === "completed")
                .length,
        }),
        [goals],
    );

    const handleNewGoal = useCallback(() => {
        router.push("/new-goal");
    }, [router]);

    // Memoize formatted goals to avoid re-formatting on every render
    const formattedGoals = useMemo(
        () =>
            filteredGoals.map((goal) => {
                // Format tasks for GoalCard
                const formattedTasks = goal.tasks.map((task) => {
                    let days: string | undefined;

                    // One-time task: no start_date and no end_date
                    if (!task.start_date && !task.end_date && task.log_date) {
                        days = formatDate(task.log_date);
                    }
                    // Recurring task: has repeat days
                    else if (task.repeat_days.length > 0) {
                        days = formatRepeatDays(task.repeat_days);
                    }

                    return {
                        title: task.name,
                        days,
                        time: formatTime(task.start_time),
                    };
                });

                // Format habits for GoalCard
                const formattedHabits = goal.habits.map((habit) => ({
                    title: habit.name,
                    days: formatRepeatDays(habit.repeat_days),
                }));

                const categoryName = capitalizeFirst(goal.category);
                const formattedDate = formatTargetDate(goal.target_date);

                return {
                    ...goal,
                    formattedTasks,
                    formattedHabits,
                    categoryName,
                    formattedDate,
                };
            }),
        [filteredGoals],
    );

    return (
        <div>
            <Navbar />
            <div className="ml-20 mr-7 p-6">
                <Top
                    title="My Goals"
                    buttons={[
                        {
                            text: "New Goal",
                            onClick: handleNewGoal,
                        },
                    ]}
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
                                onTaskEdit={(taskIndex) =>
                                    console.log(
                                        `Edit task ${taskIndex} from ${goal.name}`,
                                    )
                                }
                                onTaskDelete={(taskIndex) =>
                                    handleTaskDelete(goalIndex, taskIndex)
                                }
                                onHabitEdit={(habitIndex) =>
                                    console.log(
                                        `Edit habit ${habitIndex} from ${goal.name}`,
                                    )
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

            {/* Confirm Delete Modal */}
            <ConfirmModal
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
                isLoading={isDeleting}
            />
        </div>
    );
}
