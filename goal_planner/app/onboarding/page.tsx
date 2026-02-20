"use client";

import { useState, useRef, useEffect, Suspense } from "react";

export const dynamic = "force-dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { TfiArrowRight } from "react-icons/tfi";
import ProgressBar from "@/components/Onboarding/ProgressBar/ProgressBar";
import StepHeader from "@/components/Onboarding/StepHeader/StepHeader";
import NavigationButtons from "@/components/Onboarding/NavigationButtons/NavigationButtons";
import NewGoal, { NewGoalRef } from "@/components/common/NewGoal/NewGoal";
import Button from "@/components/ui/Button/Button";
import CalendarImg from "../../public/CalendarScreenshot.png";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import { createClient } from "@/lib/supabase/client";

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
    color: string;
    target_date: string;
    start_date: string;
    created_at: string;
    tasks: Task[];
    habits: Habit[];
    progress: number;
}

const DAY_MAP: { [key: string]: string } = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
};

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

const formatDateShort = (date: string | null): string | undefined => {
    if (!date) return undefined;
    const d = new Date(date);
    const day = d.getDate();
    const month = d
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
    return `${day} ${month}`;
};

export default function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStep = parseInt(searchParams.get("step") || "1", 10);
    const newGoalRef = useRef<NewGoalRef>(null);

    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoadingGoals, setIsLoadingGoals] = useState(false);
    const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);

    const handleNext = async () => {
        if (currentStep === 2) {
            // If goal not created yet, save it and stay on step 2
            if (!currentGoalId) {
                const goalId = await newGoalRef.current?.saveGoal();
                if (!goalId) {
                    return; // Don't proceed if goal creation failed
                }
                setCurrentGoalId(goalId);
                return; // Stay on step 2 to allow adding tasks/habits
            }
            // If goal already created, proceed to step 3
        }
        router.push(`/onboarding?step=${currentStep + 1}`);
    };

    const handlePrevious = () => {
        if (currentStep === 2) {
            setCurrentGoalId(null); // Reset goal when going back from step 2
        }
        router.push(`/onboarding?step=${currentStep - 1}`);
    };

    const fetchGoals = async () => {
        setIsLoadingGoals(true);
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            // Fetch goals
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

            // Fetch tasks and habits
            const [{ data: allTasks }, { data: allHabits }] = await Promise.all(
                [
                    supabase
                        .from("tasks")
                        .select(
                            "id, goal_id, name, start_time, start_date, end_date",
                        )
                        .in("goal_id", goalIds)
                        .is("deleted_at", null),
                    supabase
                        .from("habits")
                        .select("id, goal_id, name")
                        .in("goal_id", goalIds)
                        .is("deleted_at", null),
                ],
            );

            const taskIds = allTasks?.map((t: any) => t.id) || [];
            const habitIds = allHabits?.map((h: any) => h.id) || [];

            // Fetch related data
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
                if (!tasksByGoalId.has(task.goal_id)) {
                    tasksByGoalId.set(task.goal_id, []);
                }
                tasksByGoalId.get(task.goal_id)!.push(task);
            });

            allHabits?.forEach((habit: any) => {
                if (!habitsByGoalId.has(habit.goal_id)) {
                    habitsByGoalId.set(habit.goal_id, []);
                }
                habitsByGoalId.get(habit.goal_id)!.push(habit);
            });

            allTaskRepeatDays?.forEach((item: any) => {
                if (!taskRepeatDaysMap.has(item.task_id)) {
                    taskRepeatDaysMap.set(item.task_id, []);
                }
                taskRepeatDaysMap.get(item.task_id)!.push(item.day);
            });

            allHabitRepeatDays?.forEach((item: any) => {
                if (!habitRepeatDaysMap.has(item.habit_id)) {
                    habitRepeatDaysMap.set(item.habit_id, []);
                }
                habitRepeatDaysMap.get(item.habit_id)!.push(item.day);
            });

            allTaskLogs?.forEach((log: any) => {
                if (!taskLogsMap.has(log.task_id)) {
                    taskLogsMap.set(log.task_id, []);
                }
                taskLogsMap.get(log.task_id)!.push(log);
            });

            allHabitLogs?.forEach((log: any) => {
                if (!habitLogsMap.has(log.habit_id)) {
                    habitLogsMap.set(log.habit_id, []);
                }
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
                        start_time: task.start_time,
                        start_date: task.start_date,
                        end_date: task.end_date,
                        repeat_days: repeatDays,
                        log_date: logDate,
                    };
                });

                const habits: Habit[] = goalHabits.map((habit: any) => ({
                    id: habit.id,
                    name: habit.name,
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
    };

    useEffect(() => {
        if (currentStep === 3) {
            fetchGoals();
            setCurrentGoalId(null); // Reset for potential new goal creation
        }
    }, [currentStep]);

    const stepLabels = [
        "GOAL SELECTION",
        "GOAL CONFIGURATION",
        "FINAL COMMITMENT",
    ];

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen bg-deep-bg flex flex-col">
                <ProgressBar
                    currentStep={currentStep}
                    totalSteps={3}
                    stepLabel={stepLabels[currentStep - 1]}
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
                            <NewGoal ref={newGoalRef} />
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
                                goals.map((goal) => {
                                    // Format tasks for GoalCard
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
                                            return {
                                                title: task.name,
                                                days,
                                                time: formatTime(
                                                    task.start_time,
                                                ),
                                            };
                                        },
                                    );

                                    // Format habits for GoalCard
                                    const formattedHabits = goal.habits.map(
                                        (habit) => ({
                                            title: habit.name,
                                            days: formatRepeatDays(
                                                habit.repeat_days,
                                            ),
                                        }),
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
                                            targetDate={formatDate(
                                                goal.target_date,
                                            )}
                                            category={
                                                goal.category
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                goal.category.slice(1)
                                            }
                                            tasks={formattedTasks}
                                            habits={formattedHabits}
                                            onTaskAdd={() => fetchGoals()}
                                            onHabitAdd={() => fetchGoals()}
                                            onTaskEdit={(taskIndex) =>
                                                console.log(
                                                    `Edit task ${taskIndex} from ${goal.name}`,
                                                )
                                            }
                                            onTaskDelete={(taskIndex) => {
                                                console.log(
                                                    `Delete task ${taskIndex} from ${goal.name}`,
                                                );
                                                fetchGoals();
                                            }}
                                            onHabitEdit={(habitIndex) =>
                                                console.log(
                                                    `Edit habit ${habitIndex} from ${goal.name}`,
                                                )
                                            }
                                            onHabitDelete={(habitIndex) => {
                                                console.log(
                                                    `Delete habit ${habitIndex} from ${goal.name}`,
                                                );
                                                fetchGoals();
                                            }}
                                            onEdit={() =>
                                                console.log(`Edit ${goal.name}`)
                                            }
                                            onDelete={() =>
                                                console.log(
                                                    `Delete ${goal.name}`,
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
        </Suspense>
    );
}
