"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";
import { getDateKey } from "@/utils/dateUtils";
import Top from "@/components/Layout/Top/Top";
import CalendarWeeklyColumn from "../CalendarWeeklyColumn/CalendarWeeklyColumn";
import { useToggleEvent } from "@/utils/useToggleEvent";

interface CalendarWeeklyViewProps {
	onAddTask?: () => void;
	onRefresh?: () => void;
	onToggleWeek?: () => void;
	isModalOpen?: boolean;
	onAddHabit?: () => void;
	allEvents?: CalendarEvent[];
	goals?: { id: number; name: string }[];
}

export default function CalendarWeeklyView({
	onAddTask,
	onRefresh,
	onToggleWeek,
	isModalOpen = true,
	onAddHabit,
	allEvents = [],
	goals = [],
}: CalendarWeeklyViewProps) {
	const [currentDate, setCurrentDate] = useState(new Date());
	const { toggleEvent } = useToggleEvent(onRefresh);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const dayRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

	const dayNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];

	// Generate 42 days (6 weeks) for the calendar like monthly view
	const days = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDayOfMonth = new Date(year, month, 1);
		const firstDayOfWeek = firstDayOfMonth.getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const allDays: Date[] = [];

		// Previous month days
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = firstDayOfWeek - 1; i >= 0; i--) {
			allDays.push(new Date(year, month - 1, prevMonthLastDay - i));
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			allDays.push(new Date(year, month, i));
		}

		// Next month days to complete 42 days
		const remainingDays = 42 - allDays.length;
		for (let i = 1; i <= remainingDays; i++) {
			allDays.push(new Date(year, month + 1, i));
		}

		return allDays;
	}, [currentDate]);

	// Scroll to current date on mount
	useEffect(() => {
		// Small delay to ensure DOM is ready
		const timer = setTimeout(() => {
			const dateKey = getDateKey(currentDate);
			const element = dayRefsMap.current.get(dateKey);

			if (element && scrollContainerRef.current) {
				const container = scrollContainerRef.current;
				const elementLeft = element.offsetLeft;
				const elementWidth = element.offsetWidth;
				const containerWidth = container.offsetWidth;

				// Center the current date in the viewport
				const scrollPosition =
					elementLeft - containerWidth / 2 + elementWidth / 2;

				container.scrollTo({
					left: scrollPosition,
					behavior: "instant",
				});
			}
		}, 100);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentDate]);

	// Filter and organize events for all days
	const events = useMemo(() => {
		const eventsMap: Record<string, CalendarEvent[]> = {};

		allEvents.forEach((event) => {
			const dateKey = event.date;
			if (!eventsMap[dateKey]) eventsMap[dateKey] = [];
			eventsMap[dateKey].push(event);
		});

		// Sort events by time within each day
		Object.keys(eventsMap).forEach((dateKey) => {
			eventsMap[dateKey].sort((a, b) => {
				if (a.time && b.time) return a.time.localeCompare(b.time);
				if (a.time && !b.time) return -1;
				if (!a.time && b.time) return 1;
				// If both have no time or same time, sort by ID for stable order
				return a.id - b.id;
			});
		});

		return eventsMap;
	}, [allEvents]);

	const goToPreviousDay = () => {
		const prev = new Date(currentDate);
		prev.setDate(prev.getDate() - 1);
		setCurrentDate(prev);
	};

	const goToNextDay = () => {
		const next = new Date(currentDate);
		next.setDate(next.getDate() + 1);
		setCurrentDate(next);
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	const monthTitle = currentDate.toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	return (
		<div
			className={`flex-1 ml-20 lg:ml-12 xl:ml-16 2xl:ml-20 p-6 transition-all duration-300${isModalOpen ? "xl:mr-72 2xl:mr-80" : "xl:mr-12 2xl:mr-12"}`}>
			<div
				className={`w-full mx-auto max-w-[56.25rem] scale-90 lg:scale-100 origin-top transition-all duration-300 ${isModalOpen ? "xl:max-w-[59.875rem] 2xl:max-w-[59.875rem]" : "xl:max-w-[75rem] 2xl:max-w-[85rem]"}`}>
				{/* Header */}
				<Top
					title={monthTitle}
					showNavigation
					buttons={[
						{
							text: "New Habit",
							onClick: onAddHabit || (() => console.log("Add Habit clicked")),
							icon: <Plus className="w-4 h-4" />,
						},
						{
							text: "New Task",
							onClick: onAddTask || (() => console.log("Add Task clicked")),
							icon: <Plus className="w-4 h-4" />,
						},
					]}
					onPrevMonth={goToPreviousDay}
					onNextMonth={goToNextDay}
					onToday={goToToday}
					onToggleWeek={onToggleWeek}
					isWeekView={true}
				/>

				{/* Calendar Grid with Horizontal Scroll */}
				<div className="bg-deep-bg rounded-lg overflow-hidden  mx-auto">
					<div
						ref={scrollContainerRef}
						className="flex overflow-x-auto scrollbar-custom"
						style={{ scrollSnapType: "x mandatory" }}>
						{days.map((day) => {
							const dateKey = getDateKey(day);
							const dayName = dayNames[day.getDay()];
							const dayEvents = events[dateKey] || [];

							return (
								<div
									key={day.toISOString()}
									ref={(el) => {
										if (el) {
											dayRefsMap.current.set(dateKey, el);
										}
									}}
									className="w-[18.75rem] flex-shrink-0"
									style={{ scrollSnapAlign: "start" }}>
									<CalendarWeeklyColumn
										day={day}
										dayName={dayName}
										events={dayEvents}
										onToggle={toggleEvent}
										goals={goals}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
