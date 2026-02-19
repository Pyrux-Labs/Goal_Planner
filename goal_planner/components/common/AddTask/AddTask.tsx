"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import InputField from "@/components/ui/InputField/InputField";

interface AddTaskProps {
    goalId?: number;
    onClose: () => void;
    onCancel: () => void;
    showGoalSelect?: boolean;
    inline?: boolean;
}

interface Goal {
    id: number;
    name: string;
}

const DAYS = [
    { id: "monday", label: "M" },
    { id: "tuesday", label: "T" },
    { id: "wednesday", label: "W" },
    { id: "thursday", label: "T" },
    { id: "friday", label: "F" },
    { id: "saturday", label: "S" },
    { id: "sunday", label: "S" },
];

const AddTask = ({
    goalId,
    onClose,
    onCancel,
    showGoalSelect = false,
    inline = false,
}: AddTaskProps) => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(
        goalId || null,
    );
    const [taskName, setTaskName] = useState("");
    const [taskType, setTaskType] = useState<"one-time" | "repeating">(
        "repeating",
    );
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isAllDay, setIsAllDay] = useState(true);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (showGoalSelect) {
            fetchGoals();
        }
    }, [showGoalSelect]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onCancel]);

    const fetchGoals = useCallback(async () => {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
            .from("goals")
            .select("id, name")
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .order("name");

        if (data) setGoals(data);
    }, []);

    const toggleDay = useCallback((dayId: string) => {
        setSelectedDays((prev) =>
            prev.includes(dayId)
                ? prev.filter((d) => d !== dayId)
                : [...prev, dayId],
        );
    }, []);

    const handleSubmit = async () => {
        if (!taskName.trim()) return;

        if (taskType === "repeating" && selectedDays.length === 0) {
            alert("Please select at least one repeat day");
            return;
        }

        if (taskType === "repeating" && (!startDate || !endDate)) {
            alert("Please select start and end dates");
            return;
        }

        if (taskType === "one-time" && !selectedDate) {
            alert("Please select a date");
            return;
        }

        if (!isAllDay && !startTime) {
            alert("Please select a start time");
            return;
        }

        setIsSubmitting(true);

        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                alert("Please login to add tasks");
                return;
            }

            // Create task
            const taskData: any = {
                user_id: user.id,
                goal_id: selectedGoalId,
                name: taskName,
                start_date: taskType === "repeating" ? startDate : null,
                end_date: taskType === "repeating" ? endDate : null,
                start_time: !isAllDay ? startTime : null,
                end_time: !isAllDay && endTime ? endTime : null,
            };

            const { data: task, error: taskError } = await supabase
                .from("tasks")
                .insert(taskData)
                .select()
                .single();

            if (taskError) throw taskError;

            // Handle one-time task
            if (taskType === "one-time") {
                const { error: logError } = await supabase
                    .from("task_logs")
                    .insert({
                        task_id: task.id,
                        date: selectedDate,
                    });

                if (logError) throw logError;
            }

            // Handle repeating task
            if (taskType === "repeating") {
                const repeatDaysData = selectedDays.map((day) => ({
                    task_id: task.id,
                    day: day,
                }));

                const { error: repeatError } = await supabase
                    .from("task_repeat_days")
                    .insert(repeatDaysData);

                if (repeatError) throw repeatError;
            }

            onClose();
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={
                inline
                    ? "bg-modal-bg rounded-3xl border-2 border-vibrant-orange/30 p-6"
                    : "max-w-[37.5rem] bg-modal-bg rounded-3xl border-[3px] border-vibrant-orange shadow-lg shadow-vibrant-orange/50 px-10 pt-8 pb-6"
            }
        >
            <h2
                className={
                    inline
                        ? "text-white-pearl font-title text-2xl font-semibold mb-4"
                        : "text-white-pearl font-title text-3xl font-semibold mb-6 text-center"
                }
            >
                Add Task
            </h2>

            <div className="space-y-4">
                {/* Goal Select */}
                {showGoalSelect && (
                    <div>
                        <label className="block text-white-pearl mb-2 text-sm">
                            Select Goal
                        </label>
                        <select
                            value={selectedGoalId || ""}
                            onChange={(e) =>
                                setSelectedGoalId(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                )
                            }
                            className="w-full h-10 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange"
                        >
                            <option value="">Not Selected</option>
                            {goals.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Task Name */}
                <InputField
                    label="Task Name"
                    type="text"
                    placeholder="Enter task name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    labelClassName="block text-white-pearl mb-2 text-sm"
                />

                {/* Task Type Switch */}
                <div>
                    <label className="block text-white-pearl mb-2 text-sm">
                        Task Type
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTaskType("one-time")}
                            className={`flex-1 h-10 rounded-xl font-medium transition ${
                                taskType === "one-time"
                                    ? "bg-vibrant-orange text-white-pearl"
                                    : "bg-input-bg text-input-text"
                            }`}
                        >
                            One-Time
                        </button>
                        <button
                            onClick={() => setTaskType("repeating")}
                            className={`flex-1 h-10 rounded-xl font-medium transition ${
                                taskType === "repeating"
                                    ? "bg-vibrant-orange text-white-pearl"
                                    : "bg-input-bg text-input-text"
                            }`}
                        >
                            Repeating
                        </button>
                    </div>
                </div>

                {/* One-Time: Date */}
                {taskType === "one-time" && (
                    <InputField
                        label="Date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        labelClassName="block text-white-pearl mb-2 text-sm"
                    />
                )}

                {/* Repeating: Repeat Days and Date Range */}
                {taskType === "repeating" && (
                    <>
                        <div>
                            <label className="block text-white-pearl mb-2 text-sm">
                                Repeat Days
                            </label>
                            <div className="flex gap-2 justify-between">
                                {DAYS.map((day) => (
                                    <button
                                        key={day.id}
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-10 h-10 rounded-full font-semibold transition ${
                                            selectedDays.includes(day.id)
                                                ? "bg-vibrant-orange text-white-pearl"
                                                : "bg-input-bg text-input-text"
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                label="Start Date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                labelClassName="block text-white-pearl mb-2 text-sm"
                            />
                            <InputField
                                label="End Date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                labelClassName="block text-white-pearl mb-2 text-sm"
                            />
                        </div>
                    </>
                )}

                {/* All Day Task Checkbox */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="allDay"
                        checked={isAllDay}
                        onChange={(e) => setIsAllDay(e.target.checked)}
                        className="w-4 h-4 accent-vibrant-orange"
                    />
                    <label
                        htmlFor="allDay"
                        className="text-white-pearl text-sm"
                    >
                        All Day Task
                    </label>
                </div>

                {/* Time Range (if not all day) */}
                {!isAllDay && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white-pearl mb-2 text-sm">
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full h-10 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange"
                            />
                        </div>
                        <div>
                            <label className="block text-white-pearl mb-2 text-sm">
                                End Time{" "}
                                <span className="text-input-text text-xs">
                                    (Optional)
                                </span>
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full h-10 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange"
                            />
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 h-10 rounded-xl bg-input-bg text-white-pearl font-medium hover:bg-input-bg/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Adding..." : "Add Task"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTask;
