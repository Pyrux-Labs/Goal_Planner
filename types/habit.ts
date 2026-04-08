/** Type definitions for habit service operations */

export interface CreateHabitParams {
	goalId: number | null;
	name: string;
	startDate: string;
	endDate: string;
	repeatDays: string[];
}

export interface UpdateHabitParams {
	habitId: number;
	goalId: number | null;
	name: string;
	startDate: string;
	endDate: string;
	repeatDays: string[];
}
