// components/Calendar/SidebarContent/SidebarContent.tsx
import CalendarInfo from "@/components/Calendar/CalendarInfo/CalendarInfo";
import type { SidebarView } from "@/types/sidebar";
import type { CalendarEventsMap } from "@/types/calendar";

interface SidebarContentProps {
	view: SidebarView;
	events: CalendarEventsMap;
	onSuccess?: () => void; // To close the modal after creating
}

export default function SidebarContent({
	view,
	events,
	onSuccess,
}: SidebarContentProps) {
	switch (view.type) {
		case "day-info":
			return (
				<CalendarInfo
					date={view.date}
					events={events[view.date.toISOString().split("T")[0]] || []}
				/>
			);

		case "daily-analytics":
			return;

		case "weekly-stats":
			return;

		case "add-task":
			return;

		case "add-habit":
			return;

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
		default:
			return "";
	}
}
