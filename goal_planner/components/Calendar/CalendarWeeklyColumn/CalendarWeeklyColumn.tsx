import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import { DEFAULT_EVENT_COLOR } from "@/lib/constants/colors";
import { isSameDay } from "@/utils/dateUtils";
import CalendarWeeklyGoalGroup from "../CalendarWeeklyGoalGroup/CalendarWeeklyGoalGroup";
import { useMemo, memo } from "react";

interface CalendarWeeklyColumnProps {
    day: Date;
    dayName: string;
    events: CalendarEvent[];
    onToggle?: (event: CalendarEvent) => void;
    goals?: { id: number; name: string }[];
}

export default memo(function CalendarWeeklyColumn({
    day,
    dayName,
    events,
    onToggle,
    goals = [],
}: CalendarWeeklyColumnProps) {
    const isToday = isSameDay(new Date(), day);

    // Group events by goal
    const groupedEvents = useMemo(() => {
        const groups: Record<
            string,
            { goalName: string; goalColor: string; events: CalendarEvent[] }
        > = {};

        events.forEach((event) => {
            const goalKey = event.goal_id ? `goal_${event.goal_id}` : "no_goal";

            if (!groups[goalKey]) {
                // Find goal name from goals array
                const goal = goals.find((g) => g.id === event.goal_id);
                const goalName = goal ? goal.name : "";
                const goalColor = event.color || DEFAULT_EVENT_COLOR;

                groups[goalKey] = {
                    goalName,
                    goalColor,
                    events: [],
                };
            }

            groups[goalKey].events.push(event);
        });

        return Object.values(groups);
    }, [events, goals]);

    // Calculate progress for the day
    const progress = useMemo(() => {
        const total = events.length;
        const completed = events.filter((event) => event.completed).length;
        return total > 0 ? completed / total : 0;
    }, [events]);

    return (
        <div
            className={cn(
                "w-full min-h-full",
                "border-l border-line-gray first:border-l-0",
                isToday && "bg-white/[0.03] ring-1 ring-white/10 rounded-lg",
            )}
        >
            <div className={cn("p-3")}>
                <p className="text-xl font-bold text-white-pearl capitalize">
                    {day.toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p
                    className={cn(
                        "text-sm font-semibold",
                        isToday ? "text-vibrant-orange" : "text-white-pearl/80",
                    )}
                >
                    {day.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            {/* Progress Bar */}
            {events.length > 0 && (
                <div className="px-3 pb-2">
                    <div className="w-full bg-input-bg rounded-full h-1.5">
                        <div
                            className="bg-vibrant-orange h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress * 100}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="p-3 min-h-[500px]">
                {groupedEvents.length > 0 ? (
                    <div className="space-y-2">
                        {groupedEvents.map((group, index) => (
                            <CalendarWeeklyGoalGroup
                                key={`${group.goalName}-${index}`}
                                goalName={group.goalName}
                                goalColor={group.goalColor}
                                events={group.events}
                                onToggle={onToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-left text-input-text">
                        <span className="text-sm">No tasks</span>
                    </div>
                )}
            </div>
        </div>
    );
});
