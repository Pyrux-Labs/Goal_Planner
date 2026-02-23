"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { BiSolidError } from "react-icons/bi";
import { TfiArrowRight } from "react-icons/tfi";

import ProgressBar from "@/components/Onboarding/ProgressBar/ProgressBar";
import StepHeader from "@/components/Onboarding/StepHeader/StepHeader";
import NavigationButtons from "@/components/Onboarding/NavigationButtons/NavigationButtons";
import GoalForm, { GoalFormRef } from "@/components/common/GoalForm/GoalForm";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import Button from "@/components/ui/Button/Button";
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
import type { Task, Habit, Goal } from "@/types/goal";

import CalendarImg from "../../public/CalendarScreenshot.png";

export const dynamic = "force-dynamic";

// ===== STEP LABELS =====
const STEP_LABELS = [
    "GOAL SELECTION",
    "GOAL CONFIGURATION",
    "FINAL COMMITMENT",
];

// ===== COMPONENT =====
function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStep = parseInt(searchParams.get("step") || "1", 10);
    const goalFormRef = useRef<GoalFormRef>(null);

    // State
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoadingGoals, setIsLoadingGoals] = useState(false);
    const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [onboardingError, setOnboardingError] = useState("");
    const errorRef = useRef<HTMLDivElement>(null);

    // Scroll to error when it appears
    useEffect(() => {
        if (onboardingError && errorRef.current) {
            errorRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [onboardingError]);

    // Fetch goals when entering step 3
    useEffect(() => {
        if (currentStep === 3) {
            fetchGoals();
            setCurrentGoalId(null);
        }
    }, [currentStep, fetchGoals]);

    // ===== NAVIGATION =====
    const handleNext = async () => {
        setOnboardingError("");

        if (currentStep === 2) {
            if (!currentGoalId) {
                const goalId = await goalFormRef.current?.saveGoal();
                if (!goalId) return;
                setCurrentGoalId(goalId);
                return; // Stay on step 2 to add tasks/habits
            }

            // Validate at least one task or habit exists
            try {
                const supabase = createClient();
                const [{ data: tasks }, { data: habits }] = await Promise.all([
                    supabase
                        .from("tasks")
                        .select("id")
                        .eq("goal_id", currentGoalId)
                        .is("deleted_at", null)
                        .limit(1),
                    supabase
                        .from("habits")
                        .select("id")
                        .eq("goal_id", currentGoalId)
                        .is("deleted_at", null)
                        .limit(1),
                ]);

                if (
                    (!tasks || tasks.length === 0) &&
                    (!habits || habits.length === 0)
                ) {
                    setOnboardingError(
                        "Please add at least one task or habit to your goal before continuing.",
                    );
                    return;
                }
            } catch {
                setOnboardingError(
                    "Failed to validate goal. Please try again.",
                );
                return;
            }
        }

        router.push(`/onboarding?step=${currentStep + 1}`);
    };

    const handlePrevious = () => {
        if (currentStep === 2) setCurrentGoalId(null);
        router.push(`/onboarding?step=${currentStep - 1}`);
    };

    // ===== DATA FETCHING =====
    const fetchGoals = useCallback(async () => {
        setIsLoadingGoals(true);
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: goalsData, error: goalsError } = await supabase
                .from("goals")
                .select("*")
                .eq("user_id", user.id)
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (goalsError || !goalsData || goalsData.length === 0) {
                setGoals([]);
                return;
            }

            const goalIds = goalsData.map((g: any) => g.id);

            // Batch fetch tasks and habits
            const [{ data: allTasks }, { data: allHabits }] = await Promise.all(
                [
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
                ],
            );

            const taskIds = allTasks?.map((t: any) => t.id) || [];
            const habitIds = allHabits?.map((h: any) => h.id) || [];

            // Batch fetch related data
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

            // Build lookup maps
            const tasksByGoalId = new Map<number, any[]>();
            const habitsByGoalId = new Map<number, any[]>();
            const taskRepeatDaysMap = new Map<number, string[]>();
            const habitRepeatDaysMap = new Map<number, string[]>();
            const taskLogsMap = new Map<number, any[]>();
            const habitLogsMap = new Map<number, any[]>();

            allTasks?.forEach((task: any) => {
                if (!tasksByGoalId.has(task.goal_id))
                    tasksByGoalId.set(task.goal_id, []);
                tasksByGoalId.get(task.goal_id)!.push(task);
            });

            allHabits?.forEach((habit: any) => {
                if (!habitsByGoalId.has(habit.goal_id))
                    habitsByGoalId.set(habit.goal_id, []);
                habitsByGoalId.get(habit.goal_id)!.push(habit);
            });

            allTaskRepeatDays?.forEach((item: any) => {
                if (!taskRepeatDaysMap.has(item.task_id))
                    taskRepeatDaysMap.set(item.task_id, []);
                taskRepeatDaysMap.get(item.task_id)!.push(item.day);
            });

            allHabitRepeatDays?.forEach((item: any) => {
                if (!habitRepeatDaysMap.has(item.habit_id))
                    habitRepeatDaysMap.set(item.habit_id, []);
                habitRepeatDaysMap.get(item.habit_id)!.push(item.day);
            });

            allTaskLogs?.forEach((log: any) => {
                if (!taskLogsMap.has(log.task_id))
                    taskLogsMap.set(log.task_id, []);
                taskLogsMap.get(log.task_id)!.push(log);
            });

            allHabitLogs?.forEach((log: any) => {
                if (!habitLogsMap.has(log.habit_id))
                    habitLogsMap.set(log.habit_id, []);
                habitLogsMap.get(log.habit_id)!.push(log);
            });

            // Assemble goals with all data
            const goalsWithDetails: Goal[] = goalsData.map((goal: any) => {
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

                // Calculate progress
                let totalLogs = 0;
                let completedLogs = 0;

                tasks.forEach((task) => {
                    const logs = taskLogsMap.get(task.id) || [];
                    totalLogs += logs.length;
                    completedLogs += logs.filter(
                        (log: any) => log.completed,
                    ).length;
                });

                habits.forEach((habit) => {
                    const logs = habitLogsMap.get(habit.id) || [];
                    totalLogs += logs.length;
                    completedLogs += logs.filter(
                        (log: any) => log.completed,
                    ).length;
                });

                const progress =
                    totalLogs > 0
                        ? Math.round((completedLogs / totalLogs) * 100)
                        : 0;

                return {
                    id: goal.id,
                    name: goal.name,
                    description: goal.description,
                    category: goal.category,
                    color: goal.color,
                    target_date: goal.target_date,
                    start_date: goal.start_date,
                    created_at: goal.created_at,
                    tasks,
                    habits,
                    progress,
                };
            });

            setGoals(goalsWithDetails);
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setIsLoadingGoals(false);
        }
    }, []);

    // ===== GOAL DELETION =====
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
            setIsDeleteModalOpen(false);
            setGoalToDelete(null);
            await fetchGoals();
        } else {
            alert(`Failed to delete goal: ${result.error}`);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setGoalToDelete(null);
    };

    // ===== TASK/HABIT DELETION =====
    const handleTaskDelete = async (goalIndex: number, taskIndex: number) => {
        const goal = goals[goalIndex];
        const taskId = goal.tasks[taskIndex]?.id;
        if (!taskId) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.tasks[taskIndex].name}"? This will delete the task and all its logs from today onwards.`,
        );
        if (!confirmed) return;

        const result = await deleteTaskWithFutureLogs(taskId);
        if (result.success) {
            await fetchGoals();
        } else {
            alert(`Failed to delete task: ${result.error}`);
        }
    };

    const handleHabitDelete = async (goalIndex: number, habitIndex: number) => {
        const goal = goals[goalIndex];
        const habitId = goal.habits[habitIndex]?.id;
        if (!habitId) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.habits[habitIndex].name}"? This will delete the habit and all its logs from today onwards.`,
        );
        if (!confirmed) return;

        const result = await deleteHabitWithFutureLogs(habitId);
        if (result.success) {
            await fetchGoals();
        } else {
            alert(`Failed to delete habit: ${result.error}`);
        }
    };

    // ===== RENDER =====
    return (
        <>
            <div className="min-h-screen bg-deep-bg flex flex-col">
                <ProgressBar
                    currentStep={currentStep}
                    totalSteps={3}
                    stepLabel={STEP_LABELS[currentStep - 1]}
                />

                {/* Step 1: Welcome */}
                {currentStep === 1 && (
                    <>
                        <main className="flex-1 flex items-center pb-28 mx-28">
                            <div className="flex items-center gap-12 w-full">
                                <StepHeader
                                    title={
                                        <>
                                            Transform Your{" "}
                                            <span
                                                className="text-transparent bg-clip-text"
                                                style={{
                                                    backgroundImage:
                                                        "var(--main-gradient)",
                                                }}
                                            >
                                                Ambitions{" "}
                                            </span>
                                            into Reality
                                        </>
                                    }
                                    description="GoalPlanner helps you organize your life, track your habits, and achieve your biggest dreams through a simple, visual, and rewarding experience."
                                />
                                <div className="w-5/12 flex-shrink-0">
                                    <Image
                                        src={CalendarImg}
                                        alt="GoalPlanner Dashboard Preview"
                                        className="w-full h-full object-contain rounded-3xl border-2 border-input-bg"
                                    />
                                </div>
                            </div>
                        </main>
                        <footer className="fixed bottom-0 left-0 right-0 py-6 flex justify-center">
                            <Button
                                onClick={handleNext}
                                className="flex items-center justify-center w-96 h-16 gap-5 font-semibold"
                            >
                                Start Your Journey
                                <TfiArrowRight />
                            </Button>
                        </footer>
                    </>
                )}

                {/* Step 2: Define Goal */}
                {currentStep === 2 && (
                    <>
                        <main className="pt-4 pb-28 overflow-y-auto mx-28">
                            <StepHeader
                                title={
                                    currentGoalId
                                        ? "Add Tasks & Habits"
                                        : "Define Your First Goal"
                                }
                                description={
                                    currentGoalId
                                        ? "Organize your goal with tasks and daily habits. You can add more later!"
                                        : "Break down your ambition into actionable daily or weekly tasks."
                                }
                            />
                            <GoalForm ref={goalFormRef} />

                            {onboardingError && (
                                <div
                                    ref={errorRef}
                                    className="flex items-center gap-2 text-carmin text-base mt-4 mb-6 bg-carmin/10 border border-carmin rounded-2xl p-4"
                                >
                                    <BiSolidError className="text-xl flex-shrink-0" />
                                    <span>{onboardingError}</span>
                                </div>
                            )}
                        </main>
                        <NavigationButtons
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            nextLabel={
                                currentGoalId ? "Finish Setup" : "Save Goal"
                            }
                        />
                    </>
                )}

                {/* Step 3: Summary */}
                {currentStep === 3 && (
                    <>
                        <main className="pt-4 pb-28 overflow-y-auto mx-28">
                            <StepHeader
                                title="You're All Set"
                                description="Here is a summary of your created goals. You can add more now or jump straight into your dashboard."
                            />

                            {isLoadingGoals ? (
                                <div className="text-center py-12 text-white-pearl">
                                    <p className="text-lg">
                                        Loading your goals...
                                    </p>
                                </div>
                            ) : goals.length === 0 ? (
                                <div className="text-center py-12 text-input-text">
                                    <p className="text-lg">
                                        No goals created yet.
                                    </p>
                                </div>
                            ) : (
                                goals.map((goal, goalIndex) => {
                                    const formattedTasks = goal.tasks.map(
                                        (task) => {
                                            let days: string | undefined;
                                            if (
                                                !task.start_date &&
                                                !task.end_date &&
                                                task.log_date
                                            ) {
                                                days = formatDateShort(
                                                    task.log_date,
                                                );
                                            } else if (
                                                task.repeat_days.length > 0
                                            ) {
                                                days = formatRepeatDays(
                                                    task.repeat_days,
                                                );
                                            }

                                            const editData: TaskEditData = {
                                                id: task.id,
                                                goal_id: goal.id,
                                                name: task.name,
                                                start_date: task.start_date,
                                                end_date: task.end_date,
                                                start_time: null,
                                                end_time: null,
                                                repeat_days: task.repeat_days,
                                                is_repeating:
                                                    task.repeat_days.length > 0,
                                                edit_date:
                                                    task.log_date ?? undefined,
                                            };

                                            return {
                                                title: task.name,
                                                days,
                                                time: formatTime(
                                                    task.start_time,
                                                ),
                                                editData,
                                            };
                                        },
                                    );

                                    const formattedHabits = goal.habits.map(
                                        (habit) => {
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
                                                days: formatRepeatDays(
                                                    habit.repeat_days,
                                                ),
                                                editData,
                                            };
                                        },
                                    );

                                    return (
                                        <GoalCard
                                            key={goal.id}
                                            goalId={goal.id}
                                            title={goal.name}
                                            description={
                                                goal.description ||
                                                goal.category
                                            }
                                            progress={goal.progress}
                                            targetDate={formatTargetDate(
                                                goal.target_date,
                                            )}
                                            category={capitalizeFirst(
                                                goal.category,
                                            )}
                                            tasks={formattedTasks}
                                            habits={formattedHabits}
                                            onTaskAdd={() => fetchGoals()}
                                            onHabitAdd={() => fetchGoals()}
                                            onTaskDelete={(taskIndex) =>
                                                handleTaskDelete(
                                                    goalIndex,
                                                    taskIndex,
                                                )
                                            }
                                            onHabitDelete={(habitIndex) =>
                                                handleHabitDelete(
                                                    goalIndex,
                                                    habitIndex,
                                                )
                                            }
                                            onEdit={() =>
                                                router.push(
                                                    `/edit-goal?id=${goal.id}`,
                                                )
                                            }
                                            onDelete={() =>
                                                handleDeleteClick(
                                                    goal.id,
                                                    goal.name,
                                                )
                                            }
                                        />
                                    );
                                })
                            )}
                        </main>
                        <NavigationButtons
                            onPrevious={handlePrevious}
                            nextLabel="Start My Journey"
                            nextHref="/calendar"
                        />
                    </>
                )}
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
        </>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-deep-bg" />}>
            <OnboardingContent />
        </Suspense>
    );
}
