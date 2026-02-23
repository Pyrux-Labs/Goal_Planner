import CalendarCard from "../CalendarCard/CalendarCard";
import type { CalendarEventsMap } from "@/types/calendar";

interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    fullDate: Date;
}

interface CalendarGridProps {
    calendarDays: CalendarDay[];
    events?: CalendarEventsMap;
    onDateSelect?: (date: Date) => void;
    selectedDate?: Date;
    isToday: (date: Date) => boolean;
    isSelected: (date: Date) => boolean;
    getDateKey: (date: Date) => string;
    isModalOpen?: boolean;
}

export default function CalendarGrid({
    calendarDays,
    events = {},
    onDateSelect,
    selectedDate,
    isToday,
    isSelected,
    getDateKey,
    isModalOpen = true,
}: CalendarGridProps) {
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    return (
        <>
            {/* Week day headers */}
            <div
                className={`grid grid-cols-7 gap-y-1 gap-x-1 lg:gap-y-3 lg:gap-x-3 mb-2 lg:mb-4 ${isModalOpen ? "xl:gap-x-4 xl:gap-y-3 2xl:gap-x-4 2xl:gap-y-3" : "xl:gap-x-6 xl:gap-y-3 2xl:gap-x-8 2xl:gap-y-3"}`}
            >
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center text-sm font-semibold text-white-pearl h-10 flex items-center justify-center"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div
                className={`grid grid-cols-7 gap-y-1 lg:gap-y-3 ${isModalOpen ? "xl:gap-y-3 2xl:gap-y-3" : "xl:gap-y-3 2xl:gap-y-3"} gap-x-1 lg:gap-x-3 ${isModalOpen ? "xl:gap-x-4 2xl:gap-x-4" : "xl:gap-x-6 2xl:gap-x-8"}`}
            >
                {calendarDays.map((day, index) => {
                    const dateKey = getDateKey(day.fullDate);
                    const dayEvents = events[dateKey] || [];

                    return (
                        <CalendarCard
                            key={index}
                            date={day.date}
                            isCurrentMonth={day.isCurrentMonth}
                            isToday={isToday(day.fullDate)}
                            isSelected={isSelected(day.fullDate)}
                            events={dayEvents}
                            onClick={() => onDateSelect?.(day.fullDate)}
                            isModalOpen={isModalOpen}
                        />
                    );
                })}
            </div>
        </>
    );
}
