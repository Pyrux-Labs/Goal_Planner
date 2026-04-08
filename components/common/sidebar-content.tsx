import CalendarInfo from "@/components/calendar/calendar-info";
import CalendarAnalytics from "@/components/calendar/calendar-analytics";
import type { SidebarView, TaskEditData, HabitEditData } from "@/types/sidebar";
import type { CalendarEventsMap } from "@/types/calendar";
import { getDateKey } from "@/lib/date-utils";
import AddHabit from "@/components/common/add-habit";
import AddTask from "@/components/common/add-task";
import {
    EditTaskLog,
    EditHabitLog,
} from "@/components/calendar/edit-log-form";

interface SidebarContentProps {
    view: SidebarView;
    events: CalendarEventsMap;
    goals?: { id: number; name: string }[];
    onSuccess?: () => void;
    onRefresh?: () => void;
    onEditTask?: (data: TaskEditData) => void;
    onEditHabit?: (data: HabitEditData) => void;
    isWeekView?: boolean;
    currentYear?: number;
    currentMonth?: number;
}

export default function SidebarContent({
    view,
    events,
    goals,
    onSuccess,
    onRefresh,
    onEditTask,
    onEditHabit,
    isWeekView = false,
    currentYear,
    currentMonth,
}: SidebarContentProps) {
    const now = new Date();
    switch (view.type) {
        case "day-info": {
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
        }

        case "daily-analytics":
        case "weekly-stats":
            return (
                <CalendarAnalytics
                    isWeekView={isWeekView}
                    currentYear={currentYear ?? now.getFullYear()}
                    currentMonth={currentMonth ?? now.getMonth()}
                />
            );

        case "add-task":
            return (
                <AddTask
                    onClose={() => { onSuccess?.(); }}
                    onCancel={() => {}}
                    showGoalSelect
                    goals={goals}
                />
            );

        case "add-habit":
            return (
                <AddHabit
                    onClose={() => { onSuccess?.(); }}
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
                        onClose={() => { onSuccess?.(); }}
                    />
                );
            }
            return (
                <AddTask
                    editData={view.data}
                    onClose={() => { onSuccess?.(); }}
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
                        onClose={() => { onSuccess?.(); }}
                    />
                );
            }
            return (
                <AddHabit
                    editData={view.data}
                    onClose={() => { onSuccess?.(); }}
                    onCancel={() => {}}
                    goals={goals}
                />
            );

        default:
            return null;
    }
}

// Sidebar title based on the active view
export function getSidebarTitle(view: SidebarView, isWeekView = false): string {
    switch (view.type) {
        case "day-info":
            return view.date.toLocaleDateString();
        case "daily-analytics":
        case "weekly-stats":
            return isWeekView ? "Week" : "Month";
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
