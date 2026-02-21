// components/Calendar/SidebarContent/SidebarContent.tsx
import CalendarInfo from "@/components/Calendar/CalendarInfo/CalendarInfo";
import type { SidebarView } from "@/types/sidebar";
import type { CalendarEventsMap } from "@/types/calendar";
import { getDateKey } from "@/utils/dateUtils";
import AddHabit from "../AddHabit/AddHabit";
import AddTask from "../AddTask/AddTask";

interface SidebarContentProps {
	view: SidebarView;
	events: CalendarEventsMap;
	onSuccess?: () => void; // To close the modal after creating
	onRefresh?: () => void; // To refresh the data
}

export default function SidebarContent({
	view,
	events,
	onSuccess,
	onRefresh,
}: SidebarContentProps) {
	switch (view.type) {
		case "day-info":
			const dateKey = getDateKey(view.date);
			const dayEvents = events[dateKey] || [];
			return (
				<CalendarInfo
					date={view.date}
					events={dayEvents}
					onRefresh={onRefresh}
				/>
			);

		case "daily-analytics":
			return;

		case "weekly-stats":
			return;

		case "add-task":
			return (
				<AddTask
					onClose={() => {
						onSuccess?.();
					}}
					onCancel={() => {}}
					showGoalSelect
				/>
			);

		case "add-habit":
			return (
				<AddHabit
					onClose={() => {
						onSuccess?.();
					}}
					onCancel={() => {}}
					showGoalSelect
				/>
			);

		case "edit-task":
			// TODO: Implement EditTask component
			return (
				<div className="p-4">
					<h3 className="text-lg font-semibold mb-2">Edit Task</h3>
					<p>Task ID: {view.taskId}</p>
					<p>EditTask component to be implemented</p>
				</div>
			);

		case "edit-habit":
			// TODO: Implement EditHabit component
			return (
				<div className="p-4">
					<h3 className="text-lg font-semibold mb-2">Edit Habit</h3>
					<p>Habit ID: {view.habitId}</p>
					<p>EditHabit component to be implemented</p>
				</div>
			);

		default:
			return null;
	}
}

// Helper for the titles
export function getSidebarTitle(view: SidebarView): string {
	switch (view.type) {
		case "day-info":
			return view.date.toLocaleDateString();
		case "daily-analytics":
			return "Daily Analytics";
		case "weekly-stats":
			return "Weekly Statistics";
		case "add-task":
			return "New Task";
		case "add-habit":
			return "New Habit";
		case "edit-task":
			return "Edit Task";
		case "edit-habit":
			return "Edit Habit";
		default:
			return "";
	}
}
