"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Top from "@/components/Layout/Top/Top";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import GoalCardSkeleton from "@/components/common/GoalCard/GoalCardSkeleton";
import Modal from "@/components/ui/Modal/Modal";
import { useGoalsData } from "@/hooks/useGoalsData";
import { useGoalDeletion } from "@/hooks/useGoalDeletion";
import { formatGoalForDisplay } from "@/utils/goalDataUtils";
import { ROUTES } from "@/lib/constants/routes";
import { createClient } from "@/lib/supabase/client";
import { formatRepeatDays, formatTime } from "@/utils/formatUtils";
import TaskHabitSimpleView from "@/components/common/TaskHabitSimpleView/TaskHabitSimpleView";
import {
    deleteTaskCompletely,
    deleteHabitCompletely,
} from "@/utils/deleteTaskHabit";
import { useToast } from "@/components/ui/Toast/ToastContext";

// ===== FILTER OPTIONS =====
const FILTERS = [
    { id: "all" as const, label: "All" },
    { id: "active" as const, label: "Active" },
    { id: "completed" as const, label: "Completed" },
    { id: "unassigned" as const, label: "Unassigned" },
] as const;

type FilterType = (typeof FILTERS)[number]["id"];

interface UnassignedItem {
    id: number;
    name: string;
    repeat_days: string[];
    start_time: string | null;
    end_time: string | null;
    type: "task" | "habit";
}

// ===== COMPONENT =====
export default function AnualGoalsPage() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
    const { showToast } = useToast();

    const {
        goals,
        loading,
        overallProgress,
        activeCount,
        completedCount,
        refetch,
    } = useGoalsData();

    const {
        isDeleteModalOpen,
        goalToDelete,
        isDeleting,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
        handleTaskDelete,
        handleHabitDelete,
    } = useGoalDeletion(refetch);

    // Unassigned tasks/habits state
    const [unassignedItems, setUnassignedItems] = useState<UnassignedItem[]>(
        [],
    );
    const [unassignedLoading, setUnassignedLoading] = useState(false);

    const fetchUnassigned = useCallback(async () => {
        setUnassignedLoading(true);
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const [{ data: tasks }, { data: habits }] = await Promise.all([
                supabase
                    .from("tasks")
                    .select(
                        "id, name, start_time, end_time, task_repeat_days(day_of_week)",
                    )
                    .eq("user_id", user.id)
                    .is("goal_id", null)
                    .is("deleted_at", null),
                supabase
                    .from("habits")
                    .select("id, name, habit_repeat_days(day_of_week)")
                    .eq("user_id", user.id)
                    .is("goal_id", null)
                    .is("deleted_at", null),
            ]);

            const items: UnassignedItem[] = [
                ...(tasks || []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    repeat_days: (t.task_repeat_days || []).map(
                        (d: any) => d.day_of_week,
                    ),
                    start_time: t.start_time,
                    end_time: t.end_time,
                    type: "task" as const,
                })),
                ...(habits || []).map((h: any) => ({
                    id: h.id,
                    name: h.name,
                    repeat_days: (h.habit_repeat_days || []).map(
                        (d: any) => d.day_of_week,
                    ),
                    start_time: null,
                    end_time: null,
                    type: "habit" as const,
                })),
            ];

            setUnassignedItems(items);
        } catch (error) {
            console.error("Error fetching unassigned items:", error);
        } finally {
            setUnassignedLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedFilter === "unassigned") {
            fetchUnassigned();
        }
    }, [selectedFilter, fetchUnassigned]);

    const handleDeleteUnassigned = useCallback(
        async (item: UnassignedItem) => {
            const result =
                item.type === "task"
                    ? await deleteTaskCompletely(item.id)
                    : await deleteHabitCompletely(item.id);

            if (result.success) {
                showToast(
                    `${item.type === "task" ? "Task" : "Habit"} deleted`,
                    "success",
                );
                fetchUnassigned();
            } else {
                showToast(`Failed to delete ${item.type}`, "error");
            }
        },
        [fetchUnassigned, showToast],
    );

    // ===== FILTERED & FORMATTED DATA =====
    const filteredFormattedGoals = useMemo(() => {
        if (selectedFilter === "unassigned") return [];

        const filtered = goals.filter((g) => {
            if (selectedFilter === "all") return true;
            const isCompleted = g.progress >= 100;
            return selectedFilter === "completed" ? isCompleted : !isCompleted;
        });

        const sorted = filtered.sort((a, b) => {
            const aCompleted = a.progress >= 100 ? 1 : 0;
            const bCompleted = b.progress >= 100 ? 1 : 0;
            return aCompleted - bCompleted;
        });

        return sorted.map(formatGoalForDisplay);
    }, [goals, selectedFilter]);

    const unassignedTasks = useMemo(
        () => unassignedItems.filter((i) => i.type === "task"),
        [unassignedItems],
    );
    const unassignedHabits = useMemo(
        () => unassignedItems.filter((i) => i.type === "habit"),
        [unassignedItems],
    );

    const handleNewGoal = useCallback(
        () => router.push(ROUTES.NEW_GOAL),
        [router],
    );

    // ===== RENDER =====
    return (
        <>
            <Top
                title="My Goals"
                buttons={[{ text: "New Goal", onClick: handleNewGoal }]}
            />

            {/* Statistics Bar */}
            <div className="h-auto md:h-14 w-full bg-modal-bg border font-medium text-white-pearl border-input-bg rounded-3xl flex flex-col md:flex-row items-start md:items-center px-4 md:px-6 py-3 md:py-0 gap-2 md:gap-10">
                <div className="flex items-center gap-3 md:gap-10 flex-shrink-0">
                    <span>{activeCount} Active</span>
                    <span className="hidden md:inline">|</span>
                    <span>{completedCount} Completed</span>
                </div>
                <span className="hidden md:inline flex-shrink-0">|</span>
                <div className="flex items-center gap-3 w-full md:flex-1 min-w-0">
                    <span className="text-sm md:text-base flex-shrink-0">
                        Year Progress:
                        <span className="text-vibrant-orange">
                            {" "}
                            {overallProgress}%
                        </span>
                    </span>
                    <div className="flex-1 min-w-[80px] h-2 bg-input-bg rounded-full overflow-hidden">
                        <div
                            className="h-full bg-vibrant-orange transition-all"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="h-16 w-full font-medium text-white-pearl flex items-center px-4 md:px-6 gap-6 md:gap-10 my-6 md:my-8 border-b-2 pb-6 border-input-bg">
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

            {/* Content */}
            {selectedFilter === "unassigned" ? (
                <div className="max-w-[70rem] mx-auto">
                    {unassignedLoading ? (
                        <div className="text-white-pearl text-center py-8">
                            Loading...
                        </div>
                    ) : unassignedItems.length === 0 ? (
                        <div className="text-white-pearl text-center py-8">
                            No unassigned tasks or habits found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                            {/* Tasks Column */}
                            <div>
                                <h2 className="text-white-pearl font-title text-xl font-semibold mb-4">
                                    Tasks ({unassignedTasks.length})
                                </h2>
                                <div className="space-y-2">
                                    {unassignedTasks.map((item) => (
                                        <TaskHabitSimpleView
                                            key={`task-${item.id}`}
                                            title={item.name}
                                            days={formatRepeatDays(
                                                item.repeat_days,
                                            )}
                                            time={formatTime(item.start_time)}
                                            type="task"
                                            onDelete={() =>
                                                handleDeleteUnassigned(item)
                                            }
                                        />
                                    ))}
                                    {unassignedTasks.length === 0 && (
                                        <p className="text-input-text text-sm">
                                            No unassigned tasks
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* Habits Column */}
                            <div>
                                <h2 className="text-white-pearl font-title text-xl font-semibold mb-4">
                                    Habits ({unassignedHabits.length})
                                </h2>
                                <div className="space-y-2">
                                    {unassignedHabits.map((item) => (
                                        <TaskHabitSimpleView
                                            key={`habit-${item.id}`}
                                            title={item.name}
                                            days={formatRepeatDays(
                                                item.repeat_days,
                                            )}
                                            type="habit"
                                            onDelete={() =>
                                                handleDeleteUnassigned(item)
                                            }
                                        />
                                    ))}
                                    {unassignedHabits.length === 0 && (
                                        <p className="text-input-text text-sm">
                                            No unassigned habits
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 max-w-[70rem] mx-auto">
                    {loading ? (
                        <>
                            <GoalCardSkeleton />
                            <GoalCardSkeleton />
                            <GoalCardSkeleton />
                        </>
                    ) : filteredFormattedGoals.length === 0 ? (
                        <div className="text-white-pearl text-center py-8">
                            No goals found. Create your first goal!
                        </div>
                    ) : (
                        filteredFormattedGoals.map((goal) => (
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
                                onTaskAdd={() => refetch()}
                                onHabitAdd={() => refetch()}
                                onTaskDelete={(taskIndex) => {
                                    const task = goal.tasks[taskIndex];
                                    if (task)
                                        handleTaskDelete(task.id, task.name);
                                }}
                                onHabitDelete={(habitIndex) => {
                                    const habit = goal.habits[habitIndex];
                                    if (habit)
                                        handleHabitDelete(habit.id, habit.name);
                                }}
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
            )}

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
        </>
    );
}
