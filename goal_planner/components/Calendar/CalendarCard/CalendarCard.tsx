import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarCardProps {
	date?: number;
	isToday?: boolean;
	isSelected?: boolean;
	isCurrentMonth?: boolean;
	events?: CalendarEvent[];
	onClick?: () => void;
	isModalOpen?: boolean;
}

export type { CalendarCardProps };

// Función para truncar texto
const truncateText = (text: string, maxLength: number) => {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + "...";
};

// Función para calcular progreso de tareas
const calculateProgress = (events: CalendarEvent[]) => {
	if (events.length === 0) return 0;
	const completed = events.filter((event) => event.completed).length;
	return Math.round((completed / events.length) * 100);
};

export default function CalendarCard({
	date,
	isToday = false,
	isSelected = false,
	isCurrentMonth = true,
	events = [],
	onClick,
	isModalOpen = true,
}: CalendarCardProps) {
	const progress = calculateProgress(events);
	const habits = events.filter((event) => event.type === "habit");
	const tasks = events.filter((event) => event.type === "task");

	return (
		<button
			onClick={onClick}
			className={cn(
				"w-28 h-32 lg:w-32 lg:h-36 rounded-xl transition-all duration-200 flex flex-col p-2 gap-1",
				isModalOpen ? "xl:w-32 2xl:w-32" : "xl:w-40 2xl:w-44",
				"bg-modal-bg hover:scale-105 hover:shadow-xl hover:border-vibrant-orange/50 border border-input-bg",
				isToday && "bg-input-bg border-vibrant-orange border-2 shadow-lg",
				isSelected && "bg-input-bg border-vibrant-orange border-2 shadow-lg",
				!isCurrentMonth && "opacity-30",
				"group relative overflow-hidden flex-shrink-0",
			)}>
			{/* Date number */}
			{date && (
				<div
					className={cn(
						"text-xl font-semibold transition-colors text-left mx-1",
						isSelected ? "text-white-pearl" : "text-white-pearl",
						isToday && !isSelected && "text-[#D94E06]",
					)}>
					{date}
				</div>
			)}
			{/* Events */}
			<div className="flex flex-col gap-1.5 overflow-hidden flex-1">
				{tasks.slice(0, 3).map((event) => (
					<div
						key={event.id}
						className={cn(
							"text-xs leading-tight truncate flex items-center gap-1",
							"text-white-pearl",
							"transition-all duration-200",
						)}>
						{/* Color dot indicator */}
						<div
							className="w-1.5 h-1.5 rounded-full flex-shrink-0"
							style={{
								backgroundColor: event.color || "#94A3B8",
							}}
						/>
						<div className="flex-1 min-w-0 text-left">
							<span>{truncateText(event.title, 10)}</span>
						</div>
						<div className="flex-shrink-0 text-right">
							{event.time && (
								<span className="text-[10px] ml-1">{event.time}</span>
							)}
						</div>
					</div>
				))}
			</div>
			{/* More indicator */}
			{tasks.length > 3 && (
				<div className="text-base text-white-pearl font-medium text-left flex-shrink-0">
					...
				</div>
			)}

			{/* Progress bar - Bottom of card */}
			{events.length > 0 && (
				<div
					className={cn(
						"h-1 rounded-full mx-1",
						isSelected || isToday ? "bg-modal-bg" : "bg-input-bg",
					)}>
					<div
						className="h-full bg-vibrant-orange transition-all duration-300 rounded-full"
						style={{ width: `${progress}%` }}
					/>
				</div>
			)}

			{/* Habit progress dots - Always reserve space */}
			<div className="flex justify-left gap-1 mt-1 flex-shrink-0 mx-1 h-1.5">
				{habits.length > 0 &&
					habits
						.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0))
						.map((habit) => (
							<div
								key={habit.id}
								className={cn(
									"w-1.5 h-1.5 rounded-full transition-all duration-200",
									habit.completed
										? "bg-vibrant-orange"
										: isSelected || isToday
											? "bg-modal-bg"
											: "bg-input-bg",
								)}
								title={habit.title}
							/>
						))}
			</div>

			{/* Hover effect overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-[#D94E06]/0 to-[#D94E06]/0 group-hover:from-[#D94E06]/5 group-hover:to-[#D94E06]/10 transition-all duration-300 rounded-xl pointer-events-none" />
		</button>
	);
}
