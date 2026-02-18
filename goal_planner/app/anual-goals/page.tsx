"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Top from "@/components/Layout/Top/Top";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import { createClient } from "@/lib/supabase/client";

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

// ===== DATA FETCHING HELPER FUNCTIONS =====
async function fetchTasksWithDetails(
    supabase: any,
    goalId: number,
): Promise<Task[]> {
    const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, name, start_time, start_date, end_date")
        .eq("goal_id", goalId)
        .is("deleted_at", null);

    if (!tasksData) return [];

    return Promise.all(
        tasksData.map(async (task: any) => {
            // Fetch repeat days
            const { data: repeatDays } = await supabase
                .from("task_repeat_days")
                .select("day")
                .eq("task_id", task.id);

            // Fetch log date for one-time tasks (no start_date and no end_date)
            let logDate = null;
            if (!task.start_date && !task.end_date) {
                const { data: taskLog } = await supabase
                    .from("task_logs")
                    .select("date")
                    .eq("task_id", task.id)
                    .limit(1)
                    .single();

                logDate = taskLog?.date || null;
            }

            return {
                ...task,
                repeat_days: repeatDays?.map((d: any) => d.day) || [],
                log_date: logDate,
            };
        }),
    );
}

async function fetchHabitsWithDetails(
    supabase: any,
    goalId: number,
): Promise<Habit[]> {
    const { data: habitsData } = await supabase
        .from("habits")
        .select("id, name")
        .eq("goal_id", goalId)
        .is("deleted_at", null);

    if (!habitsData) return [];

    return Promise.all(
        habitsData.map(async (habit: any) => {
            const { data: repeatDays } = await supabase
                .from("habit_repeat_days")
                .select("day")
                .eq("habit_id", habit.id);

            return {
                ...habit,
                repeat_days: repeatDays?.map((d: any) => d.day) || [],
            };
        }),
    );
}

async function calculateGoalProgress(
    supabase: any,
    tasks: Task[],
    habits: Habit[],
): Promise<number> {
    let totalLogs = 0;
    let completedLogs = 0;

    // Count task logs
    for (const task of tasks) {
        const { data: taskLogs } = await supabase
            .from("task_logs")
            .select("completed")
            .eq("task_id", task.id);

        if (taskLogs) {
            totalLogs += taskLogs.length;
            completedLogs += taskLogs.filter(
                (log: any) => log.completed,
            ).length;
        }
    }

    // Count habit logs
    for (const habit of habits) {
        const { data: habitLogs } = await supabase
            .from("habit_logs")
            .select("completed")
            .eq("habit_id", habit.id);

        if (habitLogs) {
            totalLogs += habitLogs.length;
            completedLogs += habitLogs.filter(
                (log: any) => log.completed,
            ).length;
        }
    }

    return totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;
}

async function calculateOverallYearProgress(
    supabase: any,
    userId: string,
): Promise<number> {
    const currentYear = new Date().getFullYear();

    // Get all goals for the current year
    const { data: yearGoals } = await supabase
        .from("goals")
        .select("id, target_date")
        .eq("user_id", userId)
        .is("deleted_at", null);

    if (!yearGoals || yearGoals.length === 0) return 0;

    // Filter goals by current year
    const currentYearGoalIds = yearGoals
        .filter(
            (g: any) => new Date(g.target_date).getFullYear() === currentYear,
        )
        .map((g: any) => g.id);

    if (currentYearGoalIds.length === 0) return 0;

    let totalLogs = 0;
    let completedLogs = 0;

    // Get all tasks for current year goals
    const { data: tasks } = await supabase
        .from("tasks")
        .select("id")
        .in("goal_id", currentYearGoalIds)
        .is("deleted_at", null);

    // Get all habits for current year goals
    const { data: habits } = await supabase
        .from("habits")
        .select("id")
        .in("goal_id", currentYearGoalIds)
        .is("deleted_at", null);

    // Count task logs
    if (tasks && tasks.length > 0) {
        const taskIds = tasks.map((t: any) => t.id);
        const { data: taskLogs } = await supabase
            .from("task_logs")
            .select("completed")
            .in("task_id", taskIds);

        if (taskLogs) {
            totalLogs += taskLogs.length;
            completedLogs += taskLogs.filter(
                (log: any) => log.completed,
            ).length;
        }
    }

    // Count habit logs
    if (habits && habits.length > 0) {
        const habitIds = habits.map((h: any) => h.id);
        const { data: habitLogs } = await supabase
            .from("habit_logs")
            .select("completed")
            .in("habit_id", habitIds);

        if (habitLogs) {
            totalLogs += habitLogs.length;
            completedLogs += habitLogs.filter(
                (log: any) => log.completed,
            ).length;
        }
    }

    return totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;
}

// ===== COMPONENT =====
export default function AnualGoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<
        "all" | "active" | "completed"
    >("all");
    const [overallProgress, setOverallProgress] = useState(0);

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

            // Fetch all goals for the user
            const { data: goalsData, error: goalsError } = await supabase
                .from("goals")
                .select("*")
                .eq("user_id", user.id)
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (goalsError) throw goalsError;

            // Fetch detailed data for each goal
            const goalsWithDetails = await Promise.all(
                (goalsData || []).map(async (goal) => {
                    const tasks = await fetchTasksWithDetails(
                        supabase,
                        goal.id,
                    );
                    const habits = await fetchHabitsWithDetails(
                        supabase,
                        goal.id,
                    );
                    const progress = await calculateGoalProgress(
                        supabase,
                        tasks,
                        habits,
                    );

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
                    };
                }),
            );

            setGoals(goalsWithDetails);

            // Calculate overall year progress based on logs
            const yearProgress = await calculateOverallYearProgress(
                supabase,
                user.id,
            );
            setOverallProgress(yearProgress);
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    // ===== FILTERS AND STATS =====
    const FILTERS = [
        { id: "all" as const, label: "All" },
        { id: "active" as const, label: "Active" },
        { id: "completed" as const, label: "Completed" },
    ];

    const filteredGoals = goals.filter((goal) =>
        selectedFilter === "all" ? true : goal.status === selectedFilter,
    );

    const activeCount = goals.filter((g) => g.status === "active").length;
    const completedCount = goals.filter((g) => g.status === "completed").length;

    const handleNewGoal = () => {
        console.log("New Goal clicked");
    };

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
                    ) : filteredGoals.length === 0 ? (
                        <div className="text-white-pearl text-center py-8">
                            No goals found. Create your first goal!
                        </div>
                    ) : (
                        filteredGoals.map((goal) => {
                            // Format tasks for GoalCard
                            const formattedTasks = goal.tasks.map((task) => {
                                let days: string | undefined;

                                // One-time task: no start_date and no end_date
                                if (
                                    !task.start_date &&
                                    !task.end_date &&
                                    task.log_date
                                ) {
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
                            const formattedHabits = goal.habits.map(
                                (habit) => ({
                                    title: habit.name,
                                    days: formatRepeatDays(habit.repeat_days),
                                }),
                            );

                            const categoryName = capitalizeFirst(goal.category);
                            const formattedDate = formatTargetDate(
                                goal.target_date,
                            );

                            return (
                                <GoalCard
                                    key={goal.id}
                                    title={goal.name}
                                    description={
                                        goal.description || categoryName
                                    }
                                    progress={goal.progress}
                                    targetDate={formattedDate}
                                    category={categoryName}
                                    tasks={formattedTasks}
                                    habits={formattedHabits}
                                    onTaskAdd={() =>
                                        console.log(`Add task to ${goal.name}`)
                                    }
                                    onHabitAdd={() =>
                                        console.log(`Add habit to ${goal.name}`)
                                    }
                                    onTaskEdit={(taskIndex) =>
                                        console.log(
                                            `Edit task ${taskIndex} from ${goal.name}`,
                                        )
                                    }
                                    onTaskDelete={(taskIndex) =>
                                        console.log(
                                            `Delete task ${taskIndex} from ${goal.name}`,
                                        )
                                    }
                                    onHabitEdit={(habitIndex) =>
                                        console.log(
                                            `Edit habit ${habitIndex} from ${goal.name}`,
                                        )
                                    }
                                    onHabitDelete={(habitIndex) =>
                                        console.log(
                                            `Delete habit ${habitIndex} from ${goal.name}`,
                                        )
                                    }
                                    onEdit={() =>
                                        console.log(`Edit ${goal.name}`)
                                    }
                                    onDelete={() =>
                                        console.log(`Delete ${goal.name}`)
                                    }
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
