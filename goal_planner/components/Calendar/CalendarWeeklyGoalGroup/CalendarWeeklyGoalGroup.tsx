import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import { DEFAULT_EVENT_COLOR } from "@/lib/constants/colors";

interface CalendarWeeklyGoalGroupProps {
    goalName: string;
    goalColor: string;
    events: CalendarEvent[];
    onToggle?: (event: CalendarEvent) => void;
}

export default function CalendarWeeklyGoalGroup({
    goalName,
    goalColor,
    events,
    onToggle,
}: CalendarWeeklyGoalGroupProps) {
    return (
        <div
            className="bg-modal-bg rounded-lg p-2.5 mb-2 shadow-sm"
            style={{
                borderLeftColor: goalColor || DEFAULT_EVENT_COLOR,
                borderLeftWidth: "4px",
            }}
        >
            {/* Goal Header */}
            <div className="mb-1.5">
                <h3 className="text-sm font-semibold text-white-pearl truncate">
                    {goalName}
                </h3>
            </div>

            {/* Event List */}
            <div className="space-y-1">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className={cn(
                            "flex items-start gap-2.5  px-2 rounded cursor-pointer transition-opacity",
                            event.completed && "opacity-50",
                        )}
                        onClick={() => onToggle?.(event)}
                    >
                        <input
                            type="checkbox"
                            checked={event.completed}
                            readOnly
                            className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-deep-bg checked:bg-vibrant-orange cursor-pointer pointer-events-none flex-shrink-0"
                            style={{
                                accentColor: "#d94e06",
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p
                                className={cn(
                                    "text-sm truncate",
                                    event.completed
                                        ? "line-through text-white-pearl/25"
                                        : "text-white-pearl",
                                )}
                            >
                                {event.title}
                            </p>
                            {event.time && (
                                <span
                                    className={cn(
                                        "text-xs",
                                        event.completed
                                            ? "text-white-pearl/25"
                                            : "text-white-pearl",
                                    )}
                                >
                                    {event.time}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
