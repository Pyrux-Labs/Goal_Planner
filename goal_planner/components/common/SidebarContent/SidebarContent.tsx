import CalendarInfo from "@/components/Calendar/CalendarInfo/CalendarInfo";
import type { SidebarView, TaskEditData, HabitEditData } from "@/types/sidebar";
import type { CalendarEventsMap } from "@/types/calendar";
import { getDateKey } from "@/utils/dateUtils";
import AddHabit from "../AddHabit/AddHabit";
import AddTask from "../AddTask/AddTask";
import {
    EditTaskLog,
    EditHabitLog,
} from "@/components/Calendar/EditLogForm/EditLogForm";

interface SidebarContentProps {
    view: SidebarView;
    events: CalendarEventsMap;
    goals?: { id: number; name: string }[];
    onSuccess?: () => void; // To close the modal after creating
    onRefresh?: () => void; // To refresh the data
    onEditTask?: (data: TaskEditData) => void;
    onEditHabit?: (data: HabitEditData) => void;
}

export default function SidebarContent({
    view,
    events,
    goals,
    onSuccess,
    onRefresh,
    onEditTask,
    onEditHabit,
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
                    onEditTask={onEditTask}
                    onEditHabit={onEditHabit}
                />
            );

        case "daily-analytics":
            return null;

        case "weekly-stats":
            return null;

        case "add-task":
            return (
                <AddTask
                    onClose={() => {
                        onSuccess?.();
                    }}
                    onCancel={() => {}}
                    showGoalSelect
                    goals={goals}
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
                    goals={goals}
                />
            );

        case "edit-task":
            if (view.data.log_id && view.data.edit_date) {
                return (
                    <EditTaskLog
                        logId={view.data.log_id}
                        date={view.data.edit_date}
                        startTime={view.data.start_time}
                        endTime={view.data.end_time}
                        taskName={view.data.name}
                        onClose={() => {
                            onSuccess?.();
                        }}
                    />
                );
            }
            return (
                <AddTask
                    editData={view.data}
                    onClose={() => {
                        onSuccess?.();
                    }}
                    onCancel={() => {}}
                    goals={goals}
                />
            );

        case "edit-habit":
            if (view.data.log_id && view.data.edit_date) {
                return (
                    <EditHabitLog
                        logId={view.data.log_id}
                        date={view.data.edit_date}
                        habitName={view.data.name}
                        onClose={() => {
                            onSuccess?.();
                        }}
                    />
                );
            }
            return (
                <AddHabit
                    editData={view.data}
                    onClose={() => {
                        onSuccess?.();
                    }}
                    onCancel={() => {}}
                    goals={goals}
                />
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
