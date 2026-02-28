"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import InputField from "@/components/ui/InputField/InputField";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import { useFetchGoals } from "@/hooks/useFetchGoals";
import { getTodayDateString } from "@/lib/constants/validation";
import type { TaskEditData } from "@/types/sidebar";
import { DAYS } from "@/lib/constants/days";

interface AddTaskProps {
    goalId?: number;
    onClose: () => void;
    onCancel: () => void;
    showGoalSelect?: boolean;
    inline?: boolean;
    editData?: TaskEditData;
    goals?: { id: number; name: string }[];
}

const AddTask = ({
    goalId,
    onClose,
    onCancel,
    showGoalSelect = false,
    inline = false,
    editData,
    goals: preloadedGoals,
}: AddTaskProps) => {
    const isEditMode = !!editData;

    const { goals } = useFetchGoals({
        preloadedGoals,
        enabled: showGoalSelect,
    });
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(
        editData?.goal_id ?? goalId ?? null,
    );
    const [taskName, setTaskName] = useState(editData?.name ?? "");
    const [taskType, setTaskType] = useState<"one-time" | "repeating">(
        editData?.is_repeating ? "repeating" : "one-time",
    );
    const [selectedDate, setSelectedDate] = useState(editData?.edit_date ?? "");
    const [selectedDays, setSelectedDays] = useState<string[]>(
        editData?.repeat_days ?? [],
    );
    const [startDate, setStartDate] = useState(editData?.start_date ?? "");
    const [endDate, setEndDate] = useState(editData?.end_date ?? "");
    const [isAllDay, setIsAllDay] = useState(!editData?.start_time);
    const [startTime, setStartTime] = useState(editData?.start_time ?? "");
    const [endTime, setEndTime] = useState(editData?.end_time ?? "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Error states
    const [goalError, setGoalError] = useState("");
    const [taskNameError, setTaskNameError] = useState("");
    const [repeatDaysError, setRepeatDaysError] = useState("");
    const [dateRangeError, setDateRangeError] = useState("");
    const [dateError, setDateError] = useState("");
    const [startTimeError, setStartTimeError] = useState("");
    const [endTimeError, setEndTimeError] = useState("");
    const [generalError, setGeneralError] = useState("");

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onCancel]);

    const toggleDay = useCallback((dayId: string) => {
        setSelectedDays((prev) =>
            prev.includes(dayId)
                ? prev.filter((d) => d !== dayId)
                : [...prev, dayId],
        );
    }, []);

    const handleSubmit = async () => {
        // Clear all errors
        setGoalError("");
        setTaskNameError("");
        setRepeatDaysError("");
        setDateRangeError("");
        setDateError("");
        setStartTimeError("");
        setEndTimeError("");
        setGeneralError("");

        let hasErrors = false;

        if (!taskName.trim()) {
            setTaskNameError("Task name is required");
            hasErrors = true;
        }

        if (taskType === "repeating" && selectedDays.length === 0) {
            setRepeatDaysError("Please select at least one repeat day");
            hasErrors = true;
        }

        if (taskType === "repeating" && (!startDate || !endDate)) {
            setDateRangeError("Please select start and end dates");
            hasErrors = true;
        }

        if (
            taskType === "repeating" &&
            startDate &&
            endDate &&
            endDate < startDate
        ) {
            setDateRangeError("End date must be after start date");
            hasErrors = true;
        }

        if (taskType === "one-time" && !selectedDate && !inline) {
            setDateError("Please select a date");
            hasErrors = true;
        }

        // Validate dates are not in the past (only for new tasks)
        if (!isEditMode) {
            const todayStr = getTodayDateString();

            if (
                taskType === "one-time" &&
                selectedDate &&
                selectedDate < todayStr
            ) {
                setDateError("Date cannot be in the past");
                hasErrors = true;
            }

            if (taskType === "repeating" && startDate && startDate < todayStr) {
                setDateRangeError("Start date cannot be in the past");
                hasErrors = true;
            }
        }

        if (!isAllDay && !startTime) {
            setStartTimeError("Please select a start time");
            hasErrors = true;
        }

        if (hasErrors) return;

        setIsSubmitting(true);

        try {
            const supabase = createClient();

            if (isEditMode && editData) {
                // Update existing task using RPC function
                const { error } = await supabase.rpc(
                    "update_task_with_repeat_days",
                    {
                        p_task_id: editData.id,
                        p_goal_id: selectedGoalId,
                        p_name: taskName,
                        p_start_date:
                            taskType === "repeating" ? startDate : null,
                        p_end_date: taskType === "repeating" ? endDate : null,
                        p_start_time: !isAllDay ? startTime : null,
                        p_end_time: !isAllDay && endTime ? endTime : null,
                        p_repeat_days:
                            taskType === "repeating" ? selectedDays : [],
                    },
                );

                if (error?.message) throw error;
            } else {
                const { error } = await supabase.rpc(
                    "create_task_with_repeat_days",
                    {
                        p_goal_id: selectedGoalId,
                        p_name: taskName,
                        p_start_date:
                            taskType === "repeating" ? startDate : null,
                        p_end_date: taskType === "repeating" ? endDate : null,
                        p_start_time: !isAllDay ? startTime : null,
                        p_end_time: !isAllDay && endTime ? endTime : null,
                        p_is_one_time: taskType === "one-time",
                        p_one_time_date:
                            taskType === "one-time" ? selectedDate : null,
                        p_repeat_days:
                            taskType === "repeating" ? selectedDays : [],
                    },
                );

                if (error?.message) throw error;
            }

            onClose();
        } catch (error) {
            console.error("Error saving task:", error);
            setGeneralError("Failed to save task. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={
                inline
                    ? "bg-modal-bg rounded-3xl border-2 border-vibrant-orange/30 p-6"
                    : "space-y-4 px-4"
            }
        >
            {inline && (
                <h2 className="text-white-pearl font-title text-2xl font-semibold mb-4">
                    {isEditMode ? "Edit Task" : "Add Task"}
                </h2>
            )}

            <div className="space-y-4">
                {/* Goal Select */}
                {showGoalSelect && (
                    <div>
                        <label className="block text-white-pearl mb-2 text-sm">
                            Select Goal
                        </label>
                        <select
                            value={selectedGoalId || ""}
                            onChange={(e) => {
                                setSelectedGoalId(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                );
                                if (goalError) setGoalError("");
                            }}
                            className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors"
                        >
                            <option value="">Not Selected</option>
                            {goals.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.name}
                                </option>
                            ))}
                        </select>
                        {goalError && <ErrorMessage message={goalError} />}
                    </div>
                )}

                {/* Task Name */}
                <div>
                    <InputField
                        label="Task Name"
                        type="text"
                        placeholder="Enter task name"
                        value={taskName}
                        onChange={(e) => {
                            setTaskName(e.target.value);
                            if (taskNameError) setTaskNameError("");
                        }}
                        labelClassName="block text-white-pearl mb-2 text-sm"
                    />
                    {taskNameError && <ErrorMessage message={taskNameError} />}
                </div>

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
                    <div>
                        <InputField
                            label="Date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                if (dateError) setDateError("");
                            }}
                            labelClassName="block text-white-pearl mb-2 text-sm"
                        />
                        {dateError && <ErrorMessage message={dateError} />}
                    </div>
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
                                        onClick={() => {
                                            toggleDay(day.id);
                                            if (repeatDaysError)
                                                setRepeatDaysError("");
                                        }}
                                        className={`${
                                            inline
                                                ? "w-10 h-10"
                                                : "!w-7 !h-7 min-w-0 min-h-0 aspect-square text-[11px] p-0 leading-none"
                                        } rounded-full font-semibold transition flex items-center justify-center shrink-0 ${
                                            selectedDays.includes(day.id)
                                                ? "bg-vibrant-orange text-white-pearl"
                                                : "bg-input-bg text-input-text"
                                        }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                            {repeatDaysError && (
                                <ErrorMessage message={repeatDaysError} />
                            )}
                        </div>

                        <div>
                            <div
                                className={
                                    inline
                                        ? "grid grid-cols-2 gap-4"
                                        : "space-y-4"
                                }
                            >
                                <InputField
                                    label="Start Date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        if (dateRangeError)
                                            setDateRangeError("");
                                    }}
                                    labelClassName="block text-white-pearl mb-2 text-sm"
                                />
                                <InputField
                                    label="End Date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        if (dateRangeError)
                                            setDateRangeError("");
                                    }}
                                    labelClassName="block text-white-pearl mb-2 text-sm"
                                />
                            </div>
                            {dateRangeError && (
                                <ErrorMessage message={dateRangeError} />
                            )}
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
                    <div
                        className={
                            inline ? "grid grid-cols-2 gap-4" : "space-y-4"
                        }
                    >
                        <div>
                            <label className="block text-white-pearl mb-2 text-sm">
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => {
                                    setStartTime(e.target.value);
                                    if (startTimeError) setStartTimeError("");
                                }}
                                className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors"
                            />
                            {startTimeError && (
                                <ErrorMessage message={startTimeError} />
                            )}
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
                                onChange={(e) => {
                                    setEndTime(e.target.value);
                                    if (endTimeError) setEndTimeError("");
                                }}
                                className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors"
                            />
                            {endTimeError && (
                                <ErrorMessage message={endTimeError} />
                            )}
                        </div>
                    </div>
                )}

                {/* General Error */}
                {generalError && (
                    <ErrorMessage message={generalError} variant="general" />
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                    {inline && (
                        <button
                            onClick={onCancel}
                            className="flex-1 h-10 rounded-xl bg-input-bg text-white-pearl font-medium hover:bg-input-bg/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleSubmit}
                        className={
                            inline
                                ? "flex-1 h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                : "w-full h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        }
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? isEditMode
                                ? "Updating..."
                                : "Adding..."
                            : isEditMode
                              ? "Update Task"
                              : "Add Task"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTask;
