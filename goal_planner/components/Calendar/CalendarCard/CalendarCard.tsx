import { memo } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import { DEFAULT_EVENT_COLOR } from "@/lib/constants/colors";

interface CalendarCardProps {
    date?: number;
    isToday?: boolean;
    isSelected?: boolean;
    isCurrentMonth?: boolean;
    events?: CalendarEvent[];
    onClick?: () => void;
    isModalOpen?: boolean;
}

export type { CalendarCardProps };

// Función para truncar texto
const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};

// Función para calcular progreso de tareas
const calculateProgress = (events: CalendarEvent[]) => {
    if (events.length === 0) return 0;
    const completed = events.filter((event) => event.completed).length;
    return Math.round((completed / events.length) * 100);
};

const CalendarCard = memo(function CalendarCard({
    date,
    isToday = false,
    isSelected = false,
    isCurrentMonth = true,
    events = [],
    onClick,
    isModalOpen = true,
}: CalendarCardProps) {
    const progress = calculateProgress(events);
    const habits = events.filter((event) => event.type === "habit");
    const tasks = events.filter((event) => event.type === "task");

    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full aspect-[1/2] md:aspect-[4/5] lg:w-32 lg:h-36 rounded-sm md:rounded-xl transition-all duration-200 flex flex-col p-1 md:p-2 gap-0.5 md:gap-1",
                isModalOpen ? "xl:w-32 2xl:w-32" : "xl:w-40 2xl:w-44",
                "bg-modal-bg hover:scale-105 hover:shadow-xl hover:border-vibrant-orange/50 border border-input-bg",
                (isToday || isSelected) &&
                    "bg-input-bg border-vibrant-orange border-2 shadow-lg",
                !isCurrentMonth && "opacity-30",
                "group relative overflow-hidden flex-shrink-0",
            )}
        >
            {/* Date number */}
            {date && (
                <div
                    className={cn(
                        "text-xs md:text-xl font-semibold transition-colors text-center md:text-left mx-0.5 md:mx-1",
                        "text-white-pearl",
                        isToday && !isSelected && "text-vibrant-orange",
                    )}
                >
                    {date}
                </div>
            )}
            {/* Events */}
            <div className="flex flex-col gap-0.5 md:gap-1.5 overflow-hidden flex-1">
                {tasks.slice(0, 3).map((event) => (
                    <div
                        key={event.id}
                        className={cn(
                            "text-[8px] md:text-xs leading-tight truncate flex items-center gap-0.5 md:gap-1",
                            "text-white-pearl",
                            "transition-all duration-200",
                        )}
                    >
                        {/* Color dot indicator */}
                        <div
                            className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full flex-shrink-0"
                            style={{
                                backgroundColor:
                                    event.color || DEFAULT_EVENT_COLOR,
                            }}
                        />
                        <div className="flex-1 min-w-0 text-left">
                            <span>{truncateText(event.title, 6)}</span>
                        </div>
                        <div className="hidden md:block flex-shrink-0 text-right">
                            {event.time && (
                                <span className="text-[10px] ml-1">
                                    {event.time}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {/* More indicator */}
            {tasks.length > 3 && (
                <div className="text-[8px] md:text-base text-white-pearl font-medium text-left flex-shrink-0">
                    ...
                </div>
            )}

            {/* Progress bar - Bottom of card */}
            {events.length > 0 && (
                <div
                    className={cn(
                        "h-0.5 md:h-1 rounded-full mx-0.5 md:mx-1 mt-auto",
                        isSelected || isToday ? "bg-modal-bg" : "bg-input-bg",
                    )}
                >
                    <div
                        className="h-full bg-vibrant-orange transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Habit progress dots - Always reserve space */}
            <div className="flex justify-left gap-0.5 md:gap-1 mt-0.5 md:mt-1 flex-shrink-0 mx-0.5 md:mx-1 h-1 md:h-1.5">
                {habits.length > 0 &&
                    habits
                        .sort(
                            (a, b) =>
                                (b.completed ? 1 : 0) - (a.completed ? 1 : 0),
                        )
                        .map((habit) => (
                            <div
                                key={habit.id}
                                className={cn(
                                    "w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-200",
                                    habit.completed
                                        ? "bg-vibrant-orange"
                                        : isSelected || isToday
                                          ? "bg-modal-bg"
                                          : "bg-input-bg",
                                )}
                                title={habit.title}
                            />
                        ))}
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-vibrant-orange/0 to-vibrant-orange/0 group-hover:from-vibrant-orange/5 group-hover:to-vibrant-orange/10 transition-all duration-300 rounded-xl pointer-events-none" />
        </button>
    );
});

export default CalendarCard;
