import type { CalendarEvent } from "@/types/calendar";
import type { TaskEditData, HabitEditData } from "@/types/sidebar";
import { createClient } from "@/lib/supabase/client";
import { useState, useCallback, useMemo } from "react";
import DropdownMenu from "@/components/common/DropdownMenu/DropdownMenu";
import { deleteTaskLog, deleteHabitLog } from "@/utils/deleteTaskHabit";

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

    // Filter and sort tasks and habits
    const { tasks, habits, sortedTasks, sortedHabits } = useMemo(() => {
        const taskEvents = events.filter((event) => event.type === "task");
        const habitEvents = events.filter((event) => event.type === "habit");

        const sortByTime = (items: CalendarEvent[]) => {
            return [...items].sort((a, b) => {
                if (a.time && b.time) return a.time.localeCompare(b.time);
                if (a.time && !b.time) return -1;
                if (!a.time && b.time) return 1;
                return 0;
            });
        };

        return {
            tasks: taskEvents,
            habits: habitEvents,
            sortedTasks: sortByTime(taskEvents),
            sortedHabits: sortByTime(habitEvents),
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
            if (updatingIds.has(event.id)) return;
            setUpdatingIds((prev) => new Set(prev).add(event.id));

            const result = isHabit
                ? await deleteHabitLog(event.id)
                : await deleteTaskLog(event.id);

            if (!result.success) {
                console.error("Error deleting log:", result.error);
                alert(`Failed to delete ${isHabit ? "habit" : "task"} log`);
            } else {
                onRefresh?.();
            }

            setUpdatingIds((prev) => {
                const next = new Set(prev);
                next.delete(event.id);
                return next;
            });
        },
        [updatingIds, onRefresh],
    );

    const handleToggle = useCallback(
        async (event: CalendarEvent) => {
            if (updatingIds.has(event.id)) return;
            setUpdatingIds((prev) => new Set(prev).add(event.id));

            const supabase = createClient();
            const table = event.type === "task" ? "task_logs" : "habit_logs";

            const { error } = await supabase
                .from(table)
                .update({
                    completed: !event.completed,
                    completed_at: !event.completed
                        ? new Date().toISOString()
                        : null,
                })
                .eq("id", event.id);

            if (error) {
                console.error("Error updating:", error);
            } else {
                onRefresh?.();
            }

            setUpdatingIds((prev) => {
                const next = new Set(prev);
                next.delete(event.id);
                return next;
            });
        },
        [updatingIds, onRefresh],
    );

    const EventItem = ({
        event,
        isHabit = false,
    }: {
        event: CalendarEvent;
        isHabit?: boolean;
    }) => {
        const isUpdating = updatingIds.has(event.id);
        const typeLabel = isHabit ? "Habit" : "Task";

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

                {isHabit && (
                    <DropdownMenu
                        align="left"
                        items={[
                            {
                                label: `Edit ${typeLabel}`,
                                onClick: () => handleEditHabit(event),
                            },
                            {
                                label: `Delete ${typeLabel}`,
                                onClick: () => handleDeleteLog(event, isHabit),
                                variant: "danger" as const,
                            },
                        ]}
                    />
                )}

                <div
                    className={`flex-1 min-w-0 ${isHabit ? "text-right" : ""}`}
                >
                    <div
                        className={`text-sm truncate ${event.completed ? "line-through text-white-pearl/25" : "text-white-pearl"}`}
                    >
                        {event.title}
                    </div>
                    {event.time && (
                        <div
                            className={`text-xs ${event.completed ? "text-white-pearl/25" : "text-white-pearl"}`}
                        >
                            {event.time}
                        </div>
                    )}
                </div>

                {!isHabit && (
                    <DropdownMenu
                        items={[
                            {
                                label: `Edit ${typeLabel}`,
                                onClick: () => handleEditTask(event),
                            },
                            {
                                label: `Delete ${typeLabel}`,
                                onClick: () => handleDeleteLog(event, isHabit),
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
                        <span className="text-vibrant-orange font-medium">
                            {progress}%
                        </span>
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
                    <h3 className="text-sm font-semibold text-white-pearl">
                        Tasks
                    </h3>
                    <div className="space-y-2">
                        {sortedTasks.map((event) => (
                            <EventItem
                                key={event.id}
                                event={event}
                                isHabit={false}
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
