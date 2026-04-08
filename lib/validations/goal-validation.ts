import { getTodayDateString } from "@/lib/date-utils";

export interface GoalFormData {
    goalName: string;
    selectedCategory: string;
    startDate: string;
    targetDate: string;
    isEditMode: boolean;
}

export interface GoalFormErrors {
    goalName?: string;
    category?: string;
    startDate?: string;
    targetDate?: string;
    dateRange?: string;
}

export function validateGoalForm(data: GoalFormData): GoalFormErrors {
    const errors: GoalFormErrors = {};

    if (!data.goalName.trim()) {
        errors.goalName = "Please enter a goal name";
    }

    if (!data.selectedCategory) {
        errors.category = "Please select a category";
    }

    if (!data.startDate) {
        errors.startDate = "Please select a start date";
    }

    if (!data.targetDate) {
        errors.targetDate = "Please select a target date";
    }

    if (!data.isEditMode && data.startDate) {
        const todayStr = getTodayDateString();
        if (data.startDate < todayStr) {
            errors.startDate = "Start date cannot be in the past";
        }
    }

    if (data.startDate && data.targetDate && data.targetDate <= data.startDate) {
        errors.dateRange = "Target date must be after start date";
    }

    return errors;
}

export function hasErrors(errors: GoalFormErrors): boolean {
    return Object.keys(errors).length > 0;
}
