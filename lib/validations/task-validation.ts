import { getTodayDateString } from "@/lib/date-utils";
import { validateRepeatDaysInRange } from "@/lib/validations/repeat-days-validation";

export interface TaskFormData {
    taskName: string;
    taskType: "one-time" | "repeating";
    selectedDays: string[];
    startDate: string;
    endDate: string;
    selectedDate: string;
    isAllDay: boolean;
    startTime: string;
    isEditMode: boolean;
}

export interface TaskFormErrors {
    taskName?: string;
    repeatDays?: string;
    dateRange?: string;
    date?: string;
    startTime?: string;
}

export function validateTaskForm(data: TaskFormData): TaskFormErrors {
    const errors: TaskFormErrors = {};

    if (!data.taskName.trim()) {
        errors.taskName = "Task name is required";
    }

    if (data.taskType === "repeating" && data.selectedDays.length === 0) {
        errors.repeatDays = "Please select at least one repeat day";
    }

    if (data.taskType === "repeating" && (!data.startDate || !data.endDate)) {
        errors.dateRange = "Please select start and end dates";
    }

    if (
        data.taskType === "repeating" &&
        data.startDate &&
        data.endDate &&
        data.endDate < data.startDate
    ) {
        errors.dateRange = "End date must be after start date";
    }

    if (
        data.taskType === "repeating" &&
        data.startDate &&
        data.endDate &&
        data.selectedDays.length > 0 &&
        data.endDate >= data.startDate
    ) {
        const rangeError = validateRepeatDaysInRange(
            data.startDate,
            data.endDate,
            data.selectedDays,
        );
        if (rangeError) {
            errors.dateRange = rangeError;
        }
    }

    if (!data.isEditMode) {
        const todayStr = getTodayDateString();

        if (
            data.taskType === "one-time" &&
            data.selectedDate &&
            data.selectedDate < todayStr
        ) {
            errors.date = "Date cannot be in the past";
        }

        if (
            data.taskType === "repeating" &&
            data.startDate &&
            data.startDate < todayStr
        ) {
            errors.dateRange = "Start date cannot be in the past";
        }
    }

    if (!data.isAllDay && !data.startTime) {
        errors.startTime = "Please select a start time";
    }

    return errors;
}

export function hasErrors(errors: TaskFormErrors): boolean {
    return Object.keys(errors).length > 0;
}
