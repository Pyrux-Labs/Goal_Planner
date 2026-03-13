/**
 * Custom hook for managing sidebar/modal state in the calendar page.
 */

import { useState, useCallback } from "react";
import type { SidebarView, TaskEditData, HabitEditData } from "@/types/sidebar";

export function useSidebarState() {
	const [sidebarView, setSidebarView] = useState<SidebarView>({
		type: "closed",
	});

	const handleDateSelect = useCallback((date: Date) => {
		setSidebarView({ type: "day-info", date });
	}, []);

	const openAnalytics = useCallback(() => {
		setSidebarView({ type: "daily-analytics" });
	}, []);

	const openWeeklyStats = useCallback(() => {
		setSidebarView({ type: "weekly-stats" });
	}, []);

	const handleAddHabit = useCallback(() => {
		setSidebarView({ type: "add-habit" });
	}, []);

	const handleAddTask = useCallback(() => {
		setSidebarView({ type: "add-task" });
	}, []);

	const closeModal = useCallback(() => {
		setSidebarView({ type: "closed" });
	}, []);

	const handleEditTask = useCallback((data: TaskEditData) => {
		setSidebarView({ type: "edit-task", data });
	}, []);

	const handleEditHabit = useCallback((data: HabitEditData) => {
		setSidebarView({ type: "edit-habit", data });
	}, []);

	const isModalOpen = sidebarView.type !== "closed";

	return {
		sidebarView,
		isModalOpen,
		handleDateSelect,
		openAnalytics,
		openWeeklyStats,
		handleAddHabit,
		handleAddTask,
		closeModal,
		handleEditTask,
		handleEditHabit,
	};
}
