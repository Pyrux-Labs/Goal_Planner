import { useState, useMemo } from "react";
import CalendarGrid from "../CalendarGrid/CalendarGrid";
import Top from "../../Layout/Top/Top";
import { Plus } from "lucide-react";

export interface CalendarProps {
	events?: Record<string, CalendarEvent[]>;
	onDateSelect?: (date: Date) => void;
	selectedDate?: Date;
	onAddHabit?: () => void;
	onAddTask?: () => void;
}

interface CalendarEvent {
	id: string;
	title: string;
	color?: string;
}

export default function Calendar({
	events = {},
	onDateSelect,
	selectedDate,
	onAddHabit,
	onAddTask,
}: CalendarProps) {
	const [currentDate, setCurrentDate] = useState(new Date());

	const { year, month } = useMemo(() => {
		return {
			year: currentDate.getFullYear(),
			month: currentDate.getMonth(),
		};
	}, [currentDate]);

	const monthName = useMemo(() => {
		return new Date(year, month).toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});
	}, [year, month]);

	const calendarDays = useMemo(() => {
		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);
		const firstDayOfWeek = firstDayOfMonth.getDay();
		const daysInMonth = lastDayOfMonth.getDate();

		const days: Array<{
			date: number;
			isCurrentMonth: boolean;
			fullDate: Date;
		}> = [];

		// Previous month days
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = firstDayOfWeek - 1; i >= 0; i--) {
			days.push({
				date: prevMonthLastDay - i,
				isCurrentMonth: false,
				fullDate: new Date(year, month - 1, prevMonthLastDay - i),
			});
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			days.push({
				date: i,
				isCurrentMonth: true,
				fullDate: new Date(year, month, i),
			});
		}

		// Next month days to fill the grid
		const remainingDays = 42 - days.length; // 6 rows × 7 days
		for (let i = 1; i <= remainingDays; i++) {
			days.push({
				date: i,
				isCurrentMonth: false,
				fullDate: new Date(year, month + 1, i),
			});
		}

		return days;
	}, [year, month]);

	const handlePrevMonth = () => {
		setCurrentDate(new Date(year, month - 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(year, month + 1));
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	const isToday = (date: Date) => {
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	};

	const isSelected = (date: Date) => {
		if (!selectedDate) return false;
		return (
			date.getDate() === selectedDate.getDate() &&
			date.getMonth() === selectedDate.getMonth() &&
			date.getFullYear() === selectedDate.getFullYear()
		);
	};

	const getDateKey = (date: Date) => {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
			date.getDate(),
		).padStart(2, "0")}`;
	};

	return (
		<div className="w-full mx-auto max-w-[59.875rem] md:max-w-[56.25rem] lg:max-w-[59.875rem] scale-90 md:scale-95 lg:scale-100 origin-top">
			{/* Header */}
			<Top
				title={monthName}
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
				onPrevMonth={handlePrevMonth}
				onNextMonth={handleNextMonth}
				onToday={handleToday}
			/>

			{/* Calendar Grid */}
			<CalendarGrid
				calendarDays={calendarDays}
				events={events}
				onDateSelect={onDateSelect}
				selectedDate={selectedDate}
				isToday={isToday}
				isSelected={isSelected}
				getDateKey={getDateKey}
			/>
		</div>
	);
}
