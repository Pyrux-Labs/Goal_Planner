"use client";
import { ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import CalendarUI from "@/components/Calendar/CalendarUI/CalendarUI";
import Navbar from "@/components/Layout/Navbar/Navbar";
import SidebarModal from "@/components/ui/SidebarModal/SidebarModal";
import Button from "@/components/ui/Button/Button";
import SidebarContent, {
	getSidebarTitle,
} from "@/components/common/SidebarContent/SidebarContent";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEventsMap, CalendarEvent } from "@/types/calendar";
import type { SidebarView } from "@/types/sidebar";

export default function CalendarPage() {
	const [sidebarView, setSidebarView] = useState<SidebarView>({
		type: "closed",
	});
	const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
	const [loadedYearRange, setLoadedYearRange] = useState<{
		start: number;
		end: number;
	} | null>(null);
	const [currentYear, setCurrentYear] = useState<number>(
		new Date().getFullYear(),
	);
	const [currentMonth, setCurrentMonth] = useState<number>(
		new Date().getMonth(),
	);

	// Fetch 3 years (previous, current, next) centered on given year
	const fetchThreeYears = useCallback(async (centerYear: number) => {
		const supabase = createClient();
		const startYear = centerYear - 1;
		const endYear = centerYear + 1;

		const { data, error } = await supabase.rpc(
			"get_user_events_current_month",
			{
				p_start: `${startYear}-01-01`,
				p_end: `${endYear}-12-31`,
			},
		);

		if (error) {
			console.error("Error fetching events:", error);
		} else {
			setAllEvents(data || []);
			setLoadedYearRange({ start: startYear, end: endYear });
		}
	}, []);

	// Initial fetch on mount
	useEffect(() => {
		fetchThreeYears(new Date().getFullYear());
	}, [fetchThreeYears]);

	// Re-fetch when user navigates outside loaded range
	useEffect(() => {
		if (
			loadedYearRange &&
			(currentYear < loadedYearRange.start || currentYear > loadedYearRange.end)
		) {
			fetchThreeYears(currentYear);
		}
	}, [currentYear, loadedYearRange, fetchThreeYears]);

	// Filter events by current month (instant, no fetch needed)
	const events = useMemo(() => {
		const filtered = allEvents.filter((event) => {
			// Parse date manually to avoid timezone issues
			const [year, month] = event.date.split("-").map(Number);
			return year === currentYear && month - 1 === currentMonth;
		});

		// Transform to CalendarEventsMap format
		return filtered.reduce((acc: CalendarEventsMap, event) => {
			const dateKey = event.date;
			if (!acc[dateKey]) acc[dateKey] = [];
			acc[dateKey].push(event);
			return acc;
		}, {});
	}, [allEvents, currentYear, currentMonth]);

	// Handler for when CalendarUI changes month
	const handleMonthChange = useCallback((year: number, month: number) => {
		setCurrentYear(year);
		setCurrentMonth(month);
	}, []);

	// Sidebar handlers
	const handleDateSelect = (date: Date) => {
		setSidebarView({ type: "day-info", date });
	};

	const openAnalytics = () => {
		setSidebarView({ type: "daily-analytics" });
	};

	const openWeeklyStats = () => {
		setSidebarView({ type: "weekly-stats" });
	};

	const handleAddHabit = () => {
		setSidebarView({ type: "add-habit" });
	};

	const handleAddTask = () => {
		setSidebarView({ type: "add-task" });
	};

	const closeModal = () => {
		setSidebarView({ type: "closed" });
	};

	const handleSuccess = () => {
		// Refresh events after creating task/habit
		fetchThreeYears(currentYear);
		closeModal();
	};

	const isModalOpen = sidebarView.type !== "closed";

	return (
		<div className="min-h-screen bg-deep-bg flex">
			<Navbar />
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
			/>

			{isModalOpen && (
				<SidebarModal title={getSidebarTitle(sidebarView)} onClose={closeModal}>
					<SidebarContent
						view={sidebarView}
						events={events}
						onSuccess={handleSuccess}
					/>
				</SidebarModal>
			)}

			{!isModalOpen && (
				<Button
					onClick={openAnalytics}
					className="h-36 w-10 flex justify-center items-center fixed [writing-mode:vertical-lr] rotate-180 right-0 top-1/2 -translate-y-1/2 text-base gap-12 rounded-r-[13px] rounded-l-none">
					STATS
					<ChevronRight className="w-6 h-6" />
				</Button>
			)}
		</div>
	);
}
