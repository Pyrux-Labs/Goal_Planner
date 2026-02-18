import type { CalendarEvent } from "@/types/calendar";

interface CalendarInfoProps {
	date: Date;
	events: CalendarEvent[];
}

const CalendarInfo = ({ date, events }: CalendarInfoProps) => {
	const dateStr = date.toLocaleDateString();
	const totalEvents = events.length;
	const completedEvents = events.filter((event) => event.completed).length;
	const progress =
		totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

	return (
		<div className="p-4 space-y-4">
			<div>
				<h2 className="text-xl font-bold text-white-pearl mb-2">{dateStr}</h2>
				<div className="text-sm text-gray-400">
					{totalEvents} evento{totalEvents !== 1 ? "s" : ""} para hoy
				</div>
			</div>

			{totalEvents > 0 && (
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-white-pearl">Progreso del día</span>
						<span className="text-vibrant-orange font-medium">{progress}%</span>
					</div>
					<div className="w-full bg-input-bg rounded-full h-2">
						<div
							className="bg-vibrant-orange h-2 rounded-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}

			<div className="space-y-2">
				<h3 className="text-sm font-semibold text-white-pearl">Eventos</h3>
				{events.length > 0 ? (
					events.map((event) => (
						<div
							key={event.id}
							className="flex items-center gap-2 p-2 bg-modal-bg rounded-lg">
							<div
								className="w-3 h-3 rounded-full flex-shrink-0"
								style={{ backgroundColor: event.color || "#94A3B8" }}
							/>
							<div className="flex-1 min-w-0">
								<div className="text-sm text-white-pearl truncate">
									{event.title}
								</div>
								{event.time && (
									<div className="text-xs text-gray-400">{event.time}</div>
								)}
							</div>
							{event.completed && (
								<div className="text-xs text-green-400">✓</div>
							)}
						</div>
					))
				) : (
					<div className="text-sm text-gray-400 text-center py-4">
						No hay eventos para este día
					</div>
				)}
			</div>
		</div>
	);
};

export default CalendarInfo;
