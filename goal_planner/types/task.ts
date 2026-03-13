/** Type definitions for task service operations */

import type { TaskEditData, HabitEditData } from "./sidebar";

export interface CreateTaskParams {
	goalId: number | null;
	name: string;
	startDate: string | null;
	endDate: string | null;
	startTime: string | null;
	endTime: string | null;
	isOneTime: boolean;
	oneTimeDate: string | null;
	repeatDays: string[];
}

export interface UpdateTaskParams {
	taskId: number;
	goalId: number | null;
	name: string;
	startDate: string | null;
	endDate: string | null;
	startTime: string | null;
	endTime: string | null;
	repeatDays: string[];
}

/** Unified item type for task/habit lists in the UI */
export interface TaskHabitItem {
	title: string;
	days?: string;
	time?: string;
	completed?: boolean;
	editData?: TaskEditData | HabitEditData;
}
