import { getTodayDateString } from "@/utils/dateUtils";
import { validateRepeatDaysInRange } from "@/lib/validations/repeatDaysValidation";

export interface HabitFormData {
    habitName: string;
    selectedDays: string[];
    startDate: string;
    endDate: string;
    isEditMode: boolean;
}

export interface HabitFormErrors {
    habitName?: string;
    repeatDays?: string;
    dateRange?: string;
}

export function validateHabitForm(data: HabitFormData): HabitFormErrors {
    const errors: HabitFormErrors = {};

    if (!data.habitName.trim()) {
        errors.habitName = "Habit name is required";
    }

    if (data.selectedDays.length === 0) {
        errors.repeatDays = "Please select at least one repeat day";
    }

    if (!data.startDate || !data.endDate) {
        errors.dateRange = "Please select start and end dates";
    }

    if (!data.isEditMode && data.startDate) {
        const todayStr = getTodayDateString();
        if (data.startDate < todayStr) {
            errors.dateRange = "Start date cannot be in the past";
        }
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
        errors.dateRange = "End date must be after start date";
    }

    if (
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

    return errors;
}

export function hasErrors(errors: HabitFormErrors): boolean {
    return Object.keys(errors).length > 0;
}
