/**
 * Custom hook for fetching and managing calendar events.
 * Handles range-based fetching with ±1 month window and automatic re-fetching on navigation.
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { fetchCalendarEvents } from "@/lib/services/event-service";
import {
	getCurrentUserId,
	fetchUserGoalsList,
} from "@/lib/services/goal-service";
import type { CalendarEventsMap, CalendarEvent } from "@/types/calendar";

interface LoadedRange {
	startYear: number;
	startMonth: number;
	endYear: number;
	endMonth: number;
}

export function useCalendarEvents() {
	const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
	const [goals, setGoals] = useState<{ id: number; name: string }[]>([]);
	const [loadedRange, setLoadedRange] = useState<LoadedRange | null>(null);
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const [isLoading, setIsLoading] = useState(true);
	const isFetchingRef = useRef(false);

	const fetchEvents = useCallback(
		async (centerYear: number, centerMonth: number, showLoading = true) => {
			if (isFetchingRef.current) return;
			isFetchingRef.current = true;
			if (showLoading) setIsLoading(true);

			const startDate = new Date(centerYear, centerMonth - 1, 1);
			const endDate = new Date(centerYear, centerMonth + 2, 0);

			const p_start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-01`;
			const p_end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

			try {
				const eventsData = await fetchCalendarEvents(p_start, p_end);
				setAllEvents(eventsData);
				setLoadedRange({
					startYear: startDate.getFullYear(),
					startMonth: startDate.getMonth(),
					endYear: endDate.getFullYear(),
					endMonth: endDate.getMonth(),
				});
			} catch (err) {
				console.error("Unexpected error in fetchEvents:", err);
			} finally {
				isFetchingRef.current = false;
				setIsLoading(false);
			}
		},
		[],
	);

	const fetchGoals = useCallback(async () => {
		try {
			const userId = await getCurrentUserId();
			const data = await fetchUserGoalsList(userId);
			setGoals(data);
		} catch {
			// User not logged in, goals will remain empty
		}
	}, []);

	// Initial fetch on mount
	useEffect(() => {
		const now = new Date();
		fetchEvents(now.getFullYear(), now.getMonth());
		fetchGoals();
	}, [fetchEvents, fetchGoals]);

	// Re-fetch when month navigates outside loaded range
	useEffect(() => {
		if (loadedRange) {
			const current = currentYear * 12 + currentMonth;
			const start = loadedRange.startYear * 12 + loadedRange.startMonth;
			const end = loadedRange.endYear * 12 + loadedRange.endMonth;
			if (current < start || current > end) {
				fetchEvents(currentYear, currentMonth);
			}
		}
	}, [currentYear, currentMonth, loadedRange, fetchEvents]);

	// Events filtered for current month
	const events = useMemo(() => {
		const filtered = allEvents.filter((event) => {
			const [year, month] = event.date.split("-").map(Number);
			return year === currentYear && month - 1 === currentMonth;
		});

		return filtered.reduce((acc: CalendarEventsMap, event) => {
			const dateKey = event.date;
			if (!acc[dateKey]) acc[dateKey] = [];
			acc[dateKey].push(event);
			return acc;
		}, {});
	}, [allEvents, currentYear, currentMonth]);

	const handleMonthChange = useCallback((year: number, month: number) => {
		setCurrentYear(year);
		setCurrentMonth(month);
	}, []);

	const refresh = useCallback(() => {
		fetchEvents(currentYear, currentMonth, false);
	}, [currentYear, currentMonth, fetchEvents]);

	return {
		allEvents,
		events,
		goals,
		isLoading,
		currentYear,
		currentMonth,
		handleMonthChange,
		refresh,
	};
}
