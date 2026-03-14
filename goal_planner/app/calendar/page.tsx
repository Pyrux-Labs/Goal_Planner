"use client";
import { ChevronRight } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import CalendarUI from "@/components/Calendar/CalendarUI/CalendarUI";
import CalendarWeeklyView from "@/components/Calendar/CalendarWeeklyView/CalendarWeeklyView";
import Navbar from "@/components/Layout/Navbar/Navbar";
import SidebarModal from "@/components/ui/SidebarModal/SidebarModal";
import Button from "@/components/ui/Button/Button";
import SidebarContent, {
	getSidebarTitle,
} from "@/components/common/SidebarContent/SidebarContent";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useSidebarState } from "@/hooks/useSidebarState";

export default function CalendarPage() {
	const {
		allEvents,
		events,
		goals,
		isLoading,
		currentYear,
		currentMonth,
		handleMonthChange,
		refresh,
	} = useCalendarEvents();

	const {
		sidebarView,
		isModalOpen,
		handleDateSelect,
		openAnalytics,
		handleAddHabit,
		handleAddTask,
		closeModal,
		handleEditTask,
		handleEditHabit,
	} = useSidebarState();

	const [isWeekView, setIsWeekView] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);

	// Set weekly view as default on mobile after hydration
	useEffect(() => {
		if (!hasMounted) {
			setHasMounted(true);
			if (window.innerWidth < 768) {
				setIsWeekView(true);
			}
		}
	}, [hasMounted]);

	const handleSuccess = useCallback(() => {
		refresh();
		closeModal();
	}, [refresh, closeModal]);

	const handleToggleWeek = useCallback(() => {
		setIsWeekView((prev) => !prev);
	}, []);

	return (
		<div className="min-h-screen bg-deep-bg flex">
			<Navbar />
			{isWeekView ? (
				<CalendarWeeklyView
					allEvents={allEvents}
					goals={goals}
					onAddTask={handleAddTask}
					onAddHabit={handleAddHabit}
					onRefresh={refresh}
					onToggleWeek={handleToggleWeek}
					isModalOpen={isModalOpen}
					onMonthChange={handleMonthChange}
				/>
			) : (
				<CalendarUI
					events={events}
					onDateSelect={handleDateSelect}
					selectedDate={
						sidebarView.type === "day-info" ? sidebarView.date : undefined
					}
					onAddHabit={handleAddHabit}
					onAddTask={handleAddTask}
					isModalOpen={isModalOpen}
					onMonthChange={handleMonthChange}
					onToggleWeek={handleToggleWeek}
					isWeekView={isWeekView}
					isLoading={isLoading}
				/>
			)}

			{isModalOpen && (
				<SidebarModal
					title={getSidebarTitle(sidebarView, isWeekView)}
					onClose={closeModal}>
					<SidebarContent
						view={sidebarView}
						events={events}
						goals={goals}
						onSuccess={handleSuccess}
						onRefresh={refresh}
						onEditTask={handleEditTask}
						onEditHabit={handleEditHabit}
						isWeekView={isWeekView}
						currentYear={currentYear}
						currentMonth={currentMonth}
					/>
				</SidebarModal>
			)}

			{!isModalOpen && (
				<Button
					onClick={openAnalytics}
					className="hidden md:flex h-36 w-10 justify-center items-center fixed [writing-mode:vertical-lr] rotate-180 right-0 top-1/2 -translate-y-1/2 text-base gap-12 rounded-r-[13px] rounded-l-none">
					STATS
					<ChevronRight className="w-6 h-6" />
				</Button>
			)}
		</div>
	);
}
