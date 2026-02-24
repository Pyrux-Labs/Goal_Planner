import { useState, useMemo, useEffect } from "react";
import CalendarGrid from "../CalendarGrid/CalendarGrid";
import Top from "../../Layout/Top/Top";
import { Plus } from "lucide-react";
import type { CalendarEventsMap } from "@/types/calendar";
import { getDateKey } from "@/utils/dateUtils";

export interface CalendarProps {
    events?: CalendarEventsMap;
    onDateSelect?: (date: Date) => void;
    selectedDate?: Date;
    onAddHabit?: () => void;
    onAddTask?: () => void;
    isModalOpen?: boolean;
    onMonthChange?: (year: number, month: number) => void;
    isLoading?: boolean;
}

export default function Calendar({
    events = {},
    onDateSelect,
    selectedDate,
    onAddHabit,
    onAddTask,
    isModalOpen = true,
    onMonthChange,
    isLoading = false,
}: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { year, month } = useMemo(() => {
        return {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth(),
        };
    }, [currentDate]);

    // Notificar al componente padre cuando cambia el mes
    useEffect(() => {
        onMonthChange?.(year, month);
    }, [year, month, onMonthChange]);

    const monthName = useMemo(() => {
        return new Date(year, month).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
    }, [year, month]);

    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDayOfMonth.getDay();
        const daysInMonth = lastDayOfMonth.getDate();

        const days: Array<{
            date: number;
            isCurrentMonth: boolean;
            fullDate: Date;
        }> = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDay - i,
                isCurrentMonth: false,
                fullDate: new Date(year, month - 1, prevMonthLastDay - i),
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: i,
                isCurrentMonth: true,
                fullDate: new Date(year, month, i),
            });
        }

        // Next month days to fill the grid
        const remainingDays = 42 - days.length; // 6 rows × 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: i,
                isCurrentMonth: false,
                fullDate: new Date(year, month + 1, i),
            });
        }

        return days;
    }, [year, month]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (date: Date) => {
        if (!selectedDate) return false;
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };

    return (
        <div
            className={`flex-1 ml-0 md:ml-14 lg:ml-14 xl:ml-16 2xl:ml-20 p-3 md:p-6 pb-20 md:pb-6 transition-all duration-300 ${isModalOpen ? "xl:mr-72 2xl:mr-80" : "xl:mr-12 2xl:mr-12"}`}
        >
            <div
                className={`w-full mx-auto max-w-[56.25rem]  scale-90 lg:scale-100 origin-top transition-all duration-300 ${isModalOpen ? "xl:max-w-[59.875rem] 2xl:max-w-[59.875rem]" : "xl:max-w-[75rem] 2xl:max-w-[85rem]"}`}
            >
                {/* Header */}
                <Top
                    title={monthName}
                    showNavigation
                    buttons={[
                        {
                            text: "New Habit",
                            onClick: onAddHabit || (() => {}),
                            icon: <Plus className="w-4 h-4" />,
                        },
                        {
                            text: "New Task",
                            onClick: onAddTask || (() => {}),
                            icon: <Plus className="w-4 h-4" />,
                        },
                    ]}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                    onToday={handleToday}
                />

                {/* Calendar Grid */}
                <CalendarGrid
                    calendarDays={calendarDays}
                    events={events}
                    onDateSelect={onDateSelect}
                    selectedDate={selectedDate}
                    isToday={isToday}
                    isSelected={isSelected}
                    getDateKey={getDateKey}
                    isModalOpen={isModalOpen}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
