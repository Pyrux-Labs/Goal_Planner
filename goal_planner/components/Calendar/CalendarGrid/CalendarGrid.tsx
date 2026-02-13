import CalendarCard, { type CalendarEvent } from "../CalendarCard/CalendarCard";

interface CalendarDay {
	date: number;
	isCurrentMonth: boolean;
	fullDate: Date;
}

interface CalendarGridProps {
	calendarDays: CalendarDay[];
	events?: Record<string, CalendarEvent[]>;
	onDateSelect?: (date: Date) => void;
	selectedDate?: Date;
	isToday: (date: Date) => boolean;
	isSelected: (date: Date) => boolean;
	getDateKey: (date: Date) => string;
}

export default function CalendarGrid({
	calendarDays,
	events = {},
	onDateSelect,
	selectedDate,
	isToday,
	isSelected,
	getDateKey,
}: CalendarGridProps) {
	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<>
			{/* Week day headers */}
			<div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3 xl:gap-4 mb-2 md:mb-3 lg:mb-4">
				{weekDays.map((day) => (
					<div
						key={day}
						className="text-center text-sm font-semibold text-white-pearl h-10 flex items-center justify-center">
						{day}
					</div>
				))}
			</div>

			{/* Calendar grid */}
			<div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-3 xl:gap-4">
				{calendarDays.map((day, index) => {
					const dateKey = getDateKey(day.fullDate);
					const dayEvents = events[dateKey] || [];

					return (
						<CalendarCard
							key={index}
							date={day.date}
							isCurrentMonth={day.isCurrentMonth}
							isToday={isToday(day.fullDate)}
							isSelected={isSelected(day.fullDate)}
							events={dayEvents}
							onClick={() => onDateSelect?.(day.fullDate)}
						/>
					);
				})}
			</div>
		</>
	);
}
