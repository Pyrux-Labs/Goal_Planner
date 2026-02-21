import type { CalendarEvent } from "@/types/calendar";
import type { TaskEditData, HabitEditData } from "@/types/sidebar";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Pencil } from "lucide-react";

interface CalendarInfoProps {
	date: Date;
	events: CalendarEvent[];
	onRefresh?: () => void;
	onEditTask?: (data: TaskEditData) => void;
	onEditHabit?: (data: HabitEditData) => void;
}

const CalendarInfo = ({
	date,
	events,
	onRefresh,
	onEditTask,
	onEditHabit,
}: CalendarInfoProps) => {
	const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
	const dateStr = date.toLocaleDateString();

	// Filter tasks and habits
	const tasks = events.filter((event) => event.type === "task");
	const habits = events.filter((event) => event.type === "habit");

	// Sort by time (with time first, without time after)
	const sortByTime = (items: CalendarEvent[]) => {
		return [...items].sort((a, b) => {
			// If both have time, sort by time
			if (a.time && b.time) {
				return a.time.localeCompare(b.time);
			}
			// If only one has time, it goes first
			if (a.time && !b.time) return -1;
			if (!a.time && b.time) return 1;
			// If neither has time, maintain original order
			return 0;
		});
	};

	const handleEditTask = (event: CalendarEvent) => {
		if (!onEditTask) return;

		// Transform CalendarEvent directly to TaskEditData - no fetch needed!
		const isRepeating = (event.repeat_days?.length ?? 0) > 0;

		const editData: TaskEditData = {
			id: event.task_id!, // Use task_id for editing
			goal_id: event.goal_id ?? null,
			name: event.title,
			start_date: event.start_date ?? null,
			end_date: event.end_date ?? null,
			start_time: event.start_time ?? null,
			end_time: event.end_time ?? null,
			repeat_days: event.repeat_days ?? [],
			is_repeating: isRepeating,
			edit_date: event.date,
			log_id: event.log_id,
		};

		onEditTask(editData);
	};

	const handleEditHabit = (event: CalendarEvent) => {
		if (!onEditHabit) return;

		// Transform CalendarEvent directly to HabitEditData - no fetch needed!
		const editData: HabitEditData = {
			id: event.habit_id!, // Use habit_id for editing
			goal_id: event.goal_id ?? null,
			name: event.title,
			start_date: event.start_date ?? "",
			end_date: event.end_date ?? "",
			repeat_days: event.repeat_days ?? [],
		};

		onEditHabit(editData);
	};

	const handleToggle = async (event: CalendarEvent) => {
		if (updatingIds.has(event.id)) return; // Prevent multiple clicks
		setUpdatingIds((prev) => new Set(prev).add(event.id));

		const supabase = createClient();
		const table = event.type === "task" ? "task_logs" : "habit_logs";

		const { error } = await supabase
			.from(table)
			.update({
				completed: !event.completed,
				completed_at: !event.completed ? new Date().toISOString() : null,
			})
			.eq("id", event.id);

		if (error) {
			console.error("Error updating:", error);
		} else {
			// Refrescar los datos
			onRefresh?.();
		}

		setUpdatingIds((prev) => {
			const next = new Set(prev);
			next.delete(event.id);
			return next;
		});
	};
	const sortedTasks = sortByTime(tasks);
	const sortedHabits = sortByTime(habits);

	const totalEvents = events.length;
	const completedEvents = events.filter((event) => event.completed).length;
	const progress =
		totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

	const EventItem = ({
		event,
		isHabit = false,
	}: {
		event: CalendarEvent;
		isHabit?: boolean;
	}) => {
		const isUpdating = updatingIds.has(event.id);

		return (
			<div className="flex items-center gap-2 p-2 bg-input-bg rounded-lg min-h-12 w-full">
				{!isHabit && (
					<input
						type="checkbox"
						checked={event.completed}
						className="w-4 h-4 rounded border-gray-400 text-vibrant-orange"
						onChange={() => handleToggle(event)}
						disabled={isUpdating}
						style={{
							accentColor: "#d94e06",
						}}
					/>
				)}
				<div className={`flex-1 min-w-0 ${isHabit ? "text-right" : ""}`}>
					<div
						className={`text-sm truncate ${event.completed ? "line-through text-white-pearl/25" : "text-white-pearl"}`}>
						{event.title}
					</div>
					{event.time && (
						<div
							className={`text-xs ${event.completed ? "text-white-pearl/25" : "text-white-pearl"}`}>
							{event.time}
						</div>
					)}
				</div>
				<button
					onClick={() =>
						isHabit ? handleEditHabit(event) : handleEditTask(event)
					}
					className="p-1.5 hover:bg-vibrant-orange/10 rounded-md transition-colors"
					title="Edit">
					<Pencil className="w-4 h-4 text-vibrant-orange" />
				</button>
				{isHabit && (
					<input
						type="checkbox"
						checked={event.completed}
						className="w-4 h-4 rounded border-gray-400 text-vibrant-orange"
						onChange={() => handleToggle(event)}
						disabled={isUpdating}
						style={{
							accentColor: "#d94e06",
						}}
					/>
				)}
			</div>
		);
	};

	return (
		<div className="h-full overflow-y-auto p-4 space-y-4 scrollbar-custom">
			{/* Progress Bar */}
			{totalEvents > 0 && (
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-white-pearl">Day Progress</span>
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

			{/* Tasks Section */}
			{sortedTasks.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-semibold text-white-pearl">Tasks</h3>
					<div className="space-y-2">
						{sortedTasks.map((event) => (
							<EventItem key={event.id} event={event} isHabit={false} />
						))}
					</div>
				</div>
			)}

			{/* Habits Section */}
			{sortedHabits.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-semibold text-white-pearl flex items-center gap-2 justify-end">
						<span>Habits</span>
					</h3>
					<div className="space-y-2 ">
						{sortedHabits.map((event) => (
							<EventItem key={event.id} event={event} isHabit={true} />
						))}
					</div>
				</div>
			)}

			{/* Empty State */}
			{totalEvents === 0 && (
				<div className="text-sm text-gray-400 text-center py-4">
					No events for this day
				</div>
			)}
		</div>
	);
};

export default CalendarInfo;
