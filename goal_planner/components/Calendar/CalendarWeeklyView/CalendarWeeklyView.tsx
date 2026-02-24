"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "@/types/calendar";
import { getDateKey, buildSortedEventsMap } from "@/utils/dateUtils";
import Top from "@/components/Layout/Top/Top";
import CalendarWeeklyColumn from "../CalendarWeeklyColumn/CalendarWeeklyColumn";
import { useToggleEvent } from "@/hooks/useToggleEvent";

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
	// currentDate = first visible day; today is 2nd column (index 1)
	const [currentDate, setCurrentDate] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		return d;
	});
	const [mobileDay, setMobileDay] = useState(new Date());
	const { toggleEvent } = useToggleEvent(onRefresh);

	// Filter and organize events for all days
	const events = useMemo(() => buildSortedEventsMap(allEvents), [allEvents]);

	// Desktop: 4-day window starting from currentDate
	const visibleDesktopDays = useMemo(() => {
		const result: Date[] = [];
		for (let i = 0; i < 4; i++) {
			const d = new Date(currentDate);
			d.setDate(d.getDate() + i);
			result.push(d);
		}
		return result;
	}, [currentDate]);

	// Desktop navigation: move by 1 day
	const goToPreviousPage = useCallback(() => {
		const prev = new Date(currentDate);
		prev.setDate(prev.getDate() - 1);
		setCurrentDate(prev);
	}, [currentDate]);

	const goToNextPage = useCallback(() => {
		const next = new Date(currentDate);
		next.setDate(next.getDate() + 1);
		setCurrentDate(next);
	}, [currentDate]);

	const goToToday = useCallback(() => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		setCurrentDate(d);
		setMobileDay(new Date());
	}, []);

	// Mobile navigation
	const goToPrevMobileDay = useCallback(() => {
		const prev = new Date(mobileDay);
		prev.setDate(prev.getDate() - 1);
		setMobileDay(prev);
	}, [mobileDay]);

	const goToNextMobileDay = useCallback(() => {
		const next = new Date(mobileDay);
		next.setDate(next.getDate() + 1);
		setMobileDay(next);
	}, [mobileDay]);

	const monthTitle = currentDate.toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	// Mobile: single day data
	const mobileDateKey = getDateKey(mobileDay);
	const mobileDayEvents = events[mobileDateKey] || [];

	return (
		<div
			className={`flex-1 ml-0 md:ml-14 lg:ml-14 xl:ml-16 2xl:ml-20 mr-4 md:mr-7 p-2 md:p-6 pb-20 md:pb-6 transition-all duration-300 ${isModalOpen ? "xl:mr-72 2xl:mr-80" : ""}`}>
			<div className="w-full">
				{/* Header - hidden on mobile, shown on md+ */}
				<div className="hidden md:block">
					<Top
						title={monthTitle}
						showNavigation
						buttons={[
							{
								text: "New Habit",
								onClick: onAddHabit || (() => {}),
								icon: <Plus className="w-4 h-4" />,
							},
							{
								text: "New Task",
								onClick: onAddTask || (() => {}),
								icon: <Plus className="w-4 h-4" />,
							},
						]}
						onPrevMonth={goToPreviousPage}
						onNextMonth={goToNextPage}
						onToday={goToToday}
						onToggleWeek={onToggleWeek}
						isWeekView={true}
					/>
				</div>

				{/* Mobile: single day view */}
				<div className="md:hidden">
					{/* Mobile header */}
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-bold font-title text-white-pearl">
							{mobileDay.toLocaleDateString("en-US", {
								month: "long",
								year: "numeric",
							})}
						</h2>
						<div className="flex items-center gap-1">
							<button
								onClick={goToToday}
								className="px-2 py-1 text-xs rounded bg-vibrant-orange text-white-pearl">
								Today
							</button>
							<button
								onClick={onToggleWeek}
								className="px-2 py-1 text-xs rounded bg-vibrant-orange text-white-pearl">
								Month
							</button>
						</div>
					</div>

					{/* Day navigation with arrows */}
					<div className="flex items-center gap-2 mb-4">
						<button
							onClick={goToPrevMobileDay}
							className="w-9 h-9 rounded-full bg-input-bg flex items-center justify-center text-white-pearl hover:bg-input-bg/70 transition-colors"
							aria-label="Previous day">
							<ChevronLeft className="w-5 h-5" />
						</button>

						<div className="flex-1 text-center">
							<p className="text-xl font-bold text-white-pearl">
								{mobileDay.toLocaleDateString("en-US", {
									weekday: "long",
								})}
							</p>
							<p
								className={`text-sm font-semibold ${
									new Date().toDateString() === mobileDay.toDateString()
										? "text-vibrant-orange"
										: "text-white-pearl/80"
								}`}>
								{mobileDay.toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
								})}
							</p>
						</div>

						<button
							onClick={goToNextMobileDay}
							className="w-9 h-9 rounded-full bg-input-bg flex items-center justify-center text-white-pearl hover:bg-input-bg/70 transition-colors"
							aria-label="Next day">
							<ChevronRight className="w-5 h-5" />
						</button>
					</div>

					{/* Mobile add buttons */}
					<div className="flex gap-2 mb-4">
						<button
							onClick={onAddHabit}
							className="flex-1 h-9 rounded-full bg-vibrant-orange flex items-center justify-center text-white-pearl text-sm gap-1">
							<Plus className="w-4 h-4" /> Habit
						</button>
						<button
							onClick={onAddTask}
							className="flex-1 h-9 rounded-full bg-vibrant-orange flex items-center justify-center text-white-pearl text-sm gap-1">
							<Plus className="w-4 h-4" /> Task
						</button>
					</div>

					{/* Mobile single column */}
					<div className="bg-deep-bg rounded-lg border border-line-gray overflow-hidden">
						<CalendarWeeklyColumn
							day={mobileDay}
							dayName={mobileDay.toLocaleDateString("en-US", {
								weekday: "long",
							})}
							events={mobileDayEvents}
							onToggle={toggleEvent}
							goals={goals}
						/>
					</div>
				</div>

				{/* Desktop: 4-day view */}
				<div className="hidden md:block bg-deep-bg rounded-lg overflow-hidden mx-auto">
					<div className="grid grid-cols-4">
						{visibleDesktopDays.map((day) => {
							const dateKey = getDateKey(day);
							const dayEvents = events[dateKey] || [];

							return (
								<div key={day.toISOString()}>
									<CalendarWeeklyColumn
										day={day}
										dayName={day.toLocaleDateString("en-US", {
											weekday: "long",
										})}
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
