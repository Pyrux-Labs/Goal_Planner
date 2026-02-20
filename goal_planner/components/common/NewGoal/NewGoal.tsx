import { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import Image from "next/image";
import TaskHabitColumn from "../TaskHabitColumn/TaskHabitColumn";
import InputField from "../../ui/InputField/InputField";
import { categories, colors } from "@/lib/constants/categories";
import { createClient } from "@/lib/supabase/client";

export interface NewGoalRef {
    saveGoal: () => Promise<number | null>;
}

interface NewGoalProps {
    onGoalCreated?: (goalId: number) => void;
}

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

// Map hex colors to database color names
const COLOR_MAP: Record<string, string> = {
    "#D94E06": "orange",
    "#1F6AE1": "blue",
    "#2EBB57": "green",
    "#8B5CF6": "purple",
    "#F0E23A": "yellow",
};

// Map UI category names to database enum values
const CATEGORY_MAP: Record<string, string> = {
    "Health": "health",
    "Career": "career",
    "Academic": "academic",
    "Finance": "finance",
    "Fitness": "fitness",
    "Skill": "skill",
    "Creative": "creative",
    "Social": "social",
};

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

const formatDate = (date: string | null): string | undefined => {
    if (!date) return undefined;
    const d = new Date(date);
    const day = d.getDate();
    const month = d
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
    return `${day} ${month}`;
};

const NewGoal = forwardRef<NewGoalRef, NewGoalProps>(
    ({ onGoalCreated }, ref) => {
        const [goalId, setGoalId] = useState<number | null>(null);
        const [goalName, setGoalName] = useState("");
        const [description, setDescription] = useState("");
        const [selectedCategory, setSelectedCategory] = useState("");
        const [selectedColor, setSelectedColor] = useState("#D94E06");
        const [startDate, setStartDate] = useState("");
        const [targetDate, setTargetDate] = useState("");
        const [isSaving, setIsSaving] = useState(false);
        const [tasks, setTasks] = useState<Task[]>([]);
        const [habits, setHabits] = useState<Habit[]>([]);

        const fetchTasksAndHabits = useCallback(async (currentGoalId: number) => {
            try {
                const supabase = createClient();

                // Fetch tasks with repeat days and logs
                const { data: tasksData } = await supabase
                    .from("tasks")
                    .select("id, name, start_time, start_date, end_date")
                    .eq("goal_id", currentGoalId)
                    .is("deleted_at", null);

                const taskIds = tasksData?.map((t) => t.id) || [];

                const [{ data: taskRepeatDays }, { data: taskLogs }] = await Promise.all([
                    taskIds.length > 0
                        ? supabase
                              .from("task_repeat_days")
                              .select("task_id, day")
                              .in("task_id", taskIds)
                        : Promise.resolve({ data: [] }),
                    taskIds.length > 0
                        ? supabase
                              .from("task_logs")
                              .select("task_id, date")
                              .in("task_id", taskIds)
                        : Promise.resolve({ data: [] }),
                ]);

                // Build task repeat days map
                const taskRepeatDaysMap = new Map<number, string[]>();
                taskRepeatDays?.forEach((item: any) => {
                    if (!taskRepeatDaysMap.has(item.task_id)) {
                        taskRepeatDaysMap.set(item.task_id, []);
                    }
                    taskRepeatDaysMap.get(item.task_id)!.push(item.day);
                });

                // Build task logs map
                const taskLogsMap = new Map<number, any[]>();
                taskLogs?.forEach((log: any) => {
                    if (!taskLogsMap.has(log.task_id)) {
                        taskLogsMap.set(log.task_id, []);
                    }
                    taskLogsMap.get(log.task_id)!.push(log);
                });

                const formattedTasks: Task[] = (tasksData || []).map((task) => {
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

                // Fetch habits with repeat days
                const { data: habitsData } = await supabase
                    .from("habits")
                    .select("id, name")
                    .eq("goal_id", currentGoalId)
                    .is("deleted_at", null);

                const habitIds = habitsData?.map((h) => h.id) || [];

                const { data: habitRepeatDays } = habitIds.length > 0
                    ? await supabase
                          .from("habit_repeat_days")
                          .select("habit_id, day")
                          .in("habit_id", habitIds)
                    : { data: [] };

                // Build habit repeat days map
                const habitRepeatDaysMap = new Map<number, string[]>();
                habitRepeatDays?.forEach((item: any) => {
                    if (!habitRepeatDaysMap.has(item.habit_id)) {
                        habitRepeatDaysMap.set(item.habit_id, []);
                    }
                    habitRepeatDaysMap.get(item.habit_id)!.push(item.day);
                });

                const formattedHabits: Habit[] = (habitsData || []).map((habit) => ({
                    id: habit.id,
                    name: habit.name,
                    repeat_days: habitRepeatDaysMap.get(habit.id) || [],
                }));

                setTasks(formattedTasks);
                setHabits(formattedHabits);
            } catch (error) {
                console.error("Error fetching tasks and habits:", error);
            }
        }, []);

        useImperativeHandle(ref, () => ({
            saveGoal: async () => {
                if (goalId) {
                    return goalId; // Goal already created
                }

                if (!goalName.trim()) {
                    alert("Please enter a goal name");
                    return null;
                }

                if (!selectedCategory) {
                    alert("Please select a category");
                    return null;
                }

                if (!startDate) {
                    alert("Please select a start date");
                    return null;
                }

                if (!targetDate) {
                    alert("Please select a target date");
                    return null;
                }

                // Validate that target date is after start date
                if (new Date(targetDate) <= new Date(startDate)) {
                    alert("Target date must be after start date");
                    return null;
                }

                setIsSaving(true);

                try {
                    const supabase = createClient();
                    const {
                        data: { user },
                    } = await supabase.auth.getUser();

                    if (!user) {
                        alert("Please login to create a goal");
                        return null;
                    }

                    const goalData = {
                        user_id: user.id,
                        name: goalName,
                        description: description || null,
                        category: CATEGORY_MAP[selectedCategory] || "skill",
                        color: COLOR_MAP[selectedColor] || "orange",
                        start_date: startDate,
                        target_date: targetDate,
                        status: "active",
                    };

                    console.log("Creating goal with data:", goalData);

                    const { data: goal, error } = await supabase
                        .from("goals")
                        .insert(goalData)
                        .select()
                        .single();

                    if (error) {
                        console.error("Supabase error details:", error);
                        throw error;
                    }

                    if (!goal) {
                        throw new Error("No goal returned from database");
                    }

                    setGoalId(goal.id);
                    if (onGoalCreated) {
                        onGoalCreated(goal.id);
                    }

                    // Fetch tasks and habits for the new goal
                    await fetchTasksAndHabits(goal.id);

                    return goal.id;
                } catch (error: any) {
                    console.error("Error creating goal:", error);
                    console.error("Error message:", error?.message);
                    console.error("Error details:", error?.details);
                    console.error("Error hint:", error?.hint);
                    alert(`Failed to create goal: ${error?.message || "Unknown error"}`);
                    return null;
                } finally {
                    setIsSaving(false);
                }
            },
        }));

        return (
            <div className="py-4 px-4">
                <div className="bg-modal-bg p-8 border border-input-bg rounded-3xl shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)] mb-8">
                    {/* Category Selection */}
                    <div className="mb-8">
                        <label className="block text-white-pearl mb-4">
                            SELECT CATEGORY
                        </label>
                        <div className="grid grid-cols-8 justify-items-center">
                            {categories.map((category) => (
                                <button
                                    key={category.name}
                                    onClick={() =>
                                        setSelectedCategory(category.name)
                                    }
                                    disabled={isSaving || goalId !== null}
                                    className={`relative h-24 w-24 flex items-center justify-center rounded-3xl transition-all ${
                                        selectedCategory === category.name
                                            ? "bg-vibrant-orange shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)]"
                                            : "bg-input-bg hover:shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)]"
                                    } ${isSaving || goalId !== null ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    <div className="absolute top-[38%] -translate-y-1/2">
                                        <Image
                                            src={category.icon}
                                            alt={category.name}
                                            width={36}
                                            height={36}
                                            className={`object-contain transition-colors ${
                                                selectedCategory ===
                                                category.name
                                                    ? "filter brightness-0 invert"
                                                    : ""
                                            }`}
                                        />
                                    </div>
                                    <span className="absolute bottom-3 text-xs text-white-pearl">
                                        {category.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Goal Name and Description */}
                    <div className="grid grid-cols-2 gap-9 mb-8">
                        <InputField
                            label="GOAL NAME"
                            placeholder="Master UI Design"
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                            disabled={isSaving || goalId !== null}
                        />
                        <InputField
                            label="DESCRIPTION"
                            placeholder="Describe your goal"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSaving || goalId !== null}
                        />
                    </div>
                    {/* Date and Color Selection */}
                    <div className="grid grid-cols-3 gap-9 mb-4">
                        <InputField
                            label="START DATE"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            disabled={isSaving || goalId !== null}
                        />
                        <InputField
                            label="TARGET DATE"
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            disabled={isSaving || goalId !== null}
                        />
                        <div>
                            <label className="block text-white-pearl mb-4">
                                COLOR TAG
                            </label>
                            <div className="flex items-center gap-2 w-full h-12">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        disabled={isSaving || goalId !== null}
                                        className={`w-6 h-6 rounded-full transition-all ${
                                            selectedColor === color
                                                ? "scale-110"
                                                : "hover:scale-110"
                                        } ${isSaving || goalId !== null ? "opacity-50 cursor-not-allowed" : ""}`}
                                        style={{
                                            backgroundColor: color,
                                            boxShadow:
                                                selectedColor === color
                                                    ? `0 0 10px 2px ${color}80`
                                                    : "none",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks and Daily Habits - Only show if goal is created */}
                {goalId && (
                    <div className="grid grid-cols-2 gap-14">
                        <TaskHabitColumn
                            type="task"
                            items={tasks.map((task) => {
                                let days: string | undefined;
                                if (!task.start_date && !task.end_date && task.log_date) {
                                    days = formatDate(task.log_date);
                                } else if (task.repeat_days.length > 0) {
                                    days = formatRepeatDays(task.repeat_days);
                                }
                                return {
                                    title: task.name,
                                    days,
                                    time: formatTime(task.start_time),
                                };
                            })}
                            goalId={goalId}
                            onAdd={() => fetchTasksAndHabits(goalId)}
                            onEdit={(index) => console.log("Edit task", index)}
                            onDelete={(index) => {
                                console.log("Delete task", index);
                                fetchTasksAndHabits(goalId);
                            }}
                        />
                        <TaskHabitColumn
                            type="habit"
                            items={habits.map((habit) => ({
                                title: habit.name,
                                days: formatRepeatDays(habit.repeat_days),
                            }))}
                            goalId={goalId}
                            onAdd={() => fetchTasksAndHabits(goalId)}
                            onEdit={(index) => console.log("Edit habit", index)}
                            onDelete={(index) => {
                                console.log("Delete habit", index);
                                fetchTasksAndHabits(goalId);
                            }}
                        />
                    </div>
                )}

                {/* Message when goal is not created yet */}
                {!goalId && (
                    <div className="text-center py-8 text-input-text">
                        <p className="text-lg">
                            Click "Save Goal" to continue
                        </p>
                    </div>
                )}
            </div>
        );
    },
);

NewGoal.displayName = "NewGoal";

export default NewGoal;
