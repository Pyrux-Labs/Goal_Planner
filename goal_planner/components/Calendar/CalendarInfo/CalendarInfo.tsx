import type { CalendarEvent } from "@/types/calendar";
import type { TaskEditData, HabitEditData } from "@/types/sidebar";
import { useState, useCallback, useMemo, memo } from "react";
import DropdownMenu from "@/components/common/DropdownMenu/DropdownMenu";
import { deleteTaskLog, deleteHabitLog } from "@/utils/deleteTaskHabit";
import { useToggleEvent } from "@/hooks/useToggleEvent";
import { useToast } from "@/components/ui/Toast/ToastContext";
import { sortEventsByTime } from "@/utils/dateUtils";

// ===== EXTRACTED EVENT ITEM COMPONENT =====
interface EventItemProps {
	event: CalendarEvent;
	isHabit?: boolean;
	isUpdating: boolean;
	onToggle: (event: CalendarEvent) => void;
	onEdit: (event: CalendarEvent) => void;
	onDelete: (event: CalendarEvent, isHabit: boolean) => void;
}

const EventItem = memo(function EventItem({
	event,
	isHabit = false,
	isUpdating,
	onToggle,
	onEdit,
	onDelete,
}: EventItemProps) {
	const typeLabel = isHabit ? "Habit" : "Task";

	return (
		<div className="flex items-center gap-2 p-2 bg-input-bg rounded-lg min-h-12 w-full">
			{!isHabit && (
				<input
					type="checkbox"
					checked={event.completed}
					className="w-4 h-4 rounded border-gray-400 text-vibrant-orange"
					onChange={() => onToggle(event)}
					disabled={isUpdating}
					style={{ accentColor: "#d94e06" }}
				/>
			)}

			{isHabit && (
				<DropdownMenu
					align="left"
					items={[
						{
							label: `Edit ${typeLabel}`,
							onClick: () => onEdit(event),
						},
						{
							label: `Delete ${typeLabel}`,
							onClick: () => onDelete(event, true),
							variant: "danger" as const,
						},
					]}
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

			{!isHabit && (
				<DropdownMenu
					items={[
						{
							label: `Edit ${typeLabel}`,
							onClick: () => onEdit(event),
						},
						{
							label: `Delete ${typeLabel}`,
							onClick: () => onDelete(event, false),
							variant: "danger" as const,
						},
					]}
				/>
			)}

			{isHabit && (
				<input
					type="checkbox"
					checked={event.completed}
					className="w-4 h-4 rounded border-gray-400 text-vibrant-orange"
					onChange={() => onToggle(event)}
					disabled={isUpdating}
					style={{ accentColor: "#d94e06" }}
				/>
			)}
		</div>
	);
});

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
	const { toggleEvent, updatingIds } = useToggleEvent(onRefresh);
	const [deleteUpdatingIds, setDeleteUpdatingIds] = useState<Set<number>>(
		new Set(),
	);
	const { showToast } = useToast();

	// Filter and sort tasks and habits
	const { tasks, habits, sortedTasks, sortedHabits } = useMemo(() => {
		const taskEvents = events.filter((event) => event.type === "task");
		const habitEvents = events.filter((event) => event.type === "habit");

		return {
			tasks: taskEvents,
			habits: habitEvents,
			sortedTasks: sortEventsByTime(taskEvents),
			sortedHabits: sortEventsByTime(habitEvents),
		};
	}, [events]);

	// Calculate progress
	const { totalEvents, progress } = useMemo(() => {
		const total = events.length;
		const completed = events.filter((event) => event.completed).length;
		return {
			totalEvents: total,
			progress: total > 0 ? Math.round((completed / total) * 100) : 0,
		};
	}, [events]);

	const handleEditTask = useCallback(
		(event: CalendarEvent) => {
			if (!onEditTask) return;

			const isRepeating = (event.repeat_days?.length ?? 0) > 0;

			const editData: TaskEditData = {
				id: event.task_id!,
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
		},
		[onEditTask],
	);

	const handleEditHabit = useCallback(
		(event: CalendarEvent) => {
			if (!onEditHabit) return;

			const editData: HabitEditData = {
				id: event.habit_id!,
				goal_id: event.goal_id ?? null,
				name: event.title,
				start_date: event.start_date ?? "",
				end_date: event.end_date ?? "",
				repeat_days: event.repeat_days ?? [],
			};

			onEditHabit(editData);
		},
		[onEditHabit],
	);

	const handleDeleteLog = useCallback(
		async (event: CalendarEvent, isHabit: boolean) => {
			if (deleteUpdatingIds.has(event.id)) return;
			setDeleteUpdatingIds((prev) => new Set(prev).add(event.id));

			const result = isHabit
				? await deleteHabitLog(event.id)
				: await deleteTaskLog(event.id);

			if (!result.success) {
				console.error("Error deleting log:", result.error);
				showToast(
					`Failed to delete ${isHabit ? "habit" : "task"} log`,
					"error",
				);
			} else {
				showToast(`${isHabit ? "Habit" : "Task"} log deleted`, "success");
				onRefresh?.();
			}

			setDeleteUpdatingIds((prev) => {
				const next = new Set(prev);
				next.delete(event.id);
				return next;
			});
		},
		[deleteUpdatingIds, onRefresh],
	);

	const handleToggle = useCallback(
		(event: CalendarEvent) => {
			toggleEvent(event);
		},
		[toggleEvent],
	);

	const handleEdit = useCallback(
		(event: CalendarEvent) => {
			if (event.type === "habit") handleEditHabit(event);
			else handleEditTask(event);
		},
		[handleEditTask, handleEditHabit],
	);

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
							<EventItem
								key={event.id}
								event={event}
								isHabit={false}
								isUpdating={
									updatingIds.has(event.id) || deleteUpdatingIds.has(event.id)
								}
								onToggle={handleToggle}
								onEdit={handleEdit}
								onDelete={handleDeleteLog}
							/>
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
							<EventItem
								key={event.id}
								event={event}
								isHabit={true}
								isUpdating={
									updatingIds.has(event.id) || deleteUpdatingIds.has(event.id)
								}
								onToggle={handleToggle}
								onEdit={handleEdit}
								onDelete={handleDeleteLog}
							/>
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
