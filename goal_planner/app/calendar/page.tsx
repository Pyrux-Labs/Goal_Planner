"use client";
import { ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import CalendarUI from "@/components/Calendar/CalendarUI/CalendarUI";
import CalendarWeeklyView from "@/components/Calendar/CalendarWeeklyView/CalendarWeeklyView";
import Navbar from "@/components/Layout/Navbar/Navbar";
import SidebarModal from "@/components/ui/SidebarModal/SidebarModal";
import Button from "@/components/ui/Button/Button";
import SidebarContent, {
    getSidebarTitle,
} from "@/components/common/SidebarContent/SidebarContent";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEventsMap, CalendarEvent } from "@/types/calendar";
import type { SidebarView, TaskEditData, HabitEditData } from "@/types/sidebar";

const NO_GOAL_COLOR = "#6b7280"; // grey-500 for events with no goal

export default function CalendarPage() {
    const [sidebarView, setSidebarView] = useState<SidebarView>({
        type: "closed",
    });
    const [isWeekView, setIsWeekView] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Set weekly view as default on mobile after hydration
    useEffect(() => {
        if (!hasMounted) {
            setHasMounted(true);
            if (window.innerWidth < 768) {
                setIsWeekView(true);
            }
        }
    }, [hasMounted]);
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
    const [goals, setGoals] = useState<{ id: number; name: string }[]>([]);
    const [loadedRange, setLoadedRange] = useState<{
        startYear: number;
        startMonth: number;
        endYear: number;
        endMonth: number;
    } | null>(null);
    const [currentYear, setCurrentYear] = useState<number>(
        new Date().getFullYear(),
    );
    const [currentMonth, setCurrentMonth] = useState<number>(
        new Date().getMonth(),
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // prevent concurrent fetches
    const isFetchingRef = useRef(false);

    // Fetch ±1 month around center (3 months total, ~90 days vs ~1095 with 3 years)
    const fetchEvents = useCallback(
        async (centerYear: number, centerMonth: number, showLoading = true) => {
            // prevent concurrent calls
            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            if (showLoading) setIsLoading(true);

            const supabase = createClient();

            // ±1 month: prev month 1st → next month last day
            const startDate = new Date(centerYear, centerMonth - 1, 1);
            const endDate = new Date(centerYear, centerMonth + 2, 0); // day 0 of month+2 = last day of month+1

            const p_start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}-01`;
            const p_end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;

            try {
                const { data, error } = await supabase.rpc(
                    "get_user_events_current_month",
                    { p_start, p_end },
                );

                if (error) {
                    console.error("Error fetching events:", error);
                    return;
                }

                // The RPC function returns jsonb_agg which comes as an array
                const eventsData = Array.isArray(data)
                    ? data
                    : data
                      ? [data]
                      : [];
                setAllEvents(eventsData || []);
                setLoadedRange({
                    startYear: startDate.getFullYear(),
                    startMonth: startDate.getMonth(),
                    endYear: endDate.getFullYear(),
                    endMonth: endDate.getMonth(),
                });
            } catch (err) {
                console.error("Unexpected error in fetchEvents:", err);
            } finally {
                isFetchingRef.current = false;
                setIsLoading(false);
            }
        },
        [],
    );

    // Fetch goals once on mount
    const fetchGoals = useCallback(async () => {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("goals")
            .select("id, name")
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .order("name");

        if (data) setGoals(data);
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        const now = new Date();
        fetchEvents(now.getFullYear(), now.getMonth());
        fetchGoals();
    }, [fetchEvents, fetchGoals]);

    // Re-fetch when month navigates outside loaded range
    useEffect(() => {
        if (loadedRange) {
            const current = currentYear * 12 + currentMonth;
            const start = loadedRange.startYear * 12 + loadedRange.startMonth;
            const end = loadedRange.endYear * 12 + loadedRange.endMonth;
            if (current < start || current > end) {
                fetchEvents(currentYear, currentMonth);
            }
        }
    }, [currentYear, currentMonth, loadedRange, fetchEvents]);

    // Normalize colors: grey for events without a goal
    const normalizedAllEvents = useMemo(
        () =>
            allEvents.map((event) =>
                event.goal_id ? event : { ...event, color: NO_GOAL_COLOR },
            ),
        [allEvents],
    );

    const events = useMemo(() => {
        const filtered = normalizedAllEvents.filter((event) => {
            const [year, month] = event.date.split("-").map(Number);
            return year === currentYear && month - 1 === currentMonth;
        });

        return filtered.reduce((acc: CalendarEventsMap, event) => {
            const dateKey = event.date;
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(event);
            return acc;
        }, {});
    }, [normalizedAllEvents, currentYear, currentMonth]);

    const handleMonthChange = useCallback((year: number, month: number) => {
        setCurrentYear(year);
        setCurrentMonth(month);
    }, []);

    const handleDateSelect = useCallback((date: Date) => {
        setSidebarView({ type: "day-info", date });
    }, []);

    const openAnalytics = useCallback(() => {
        setSidebarView({ type: "daily-analytics" });
    }, []);

    const openWeeklyStats = useCallback(() => {
        setSidebarView({ type: "weekly-stats" });
    }, []);

    const handleAddHabit = useCallback(() => {
        setSidebarView({ type: "add-habit" });
    }, []);

    const handleAddTask = useCallback(() => {
        setSidebarView({ type: "add-task" });
    }, []);

    const closeModal = useCallback(() => {
        setSidebarView({ type: "closed" });
    }, []);

    const handleEditTask = useCallback((data: TaskEditData) => {
        setSidebarView({ type: "edit-task", data });
    }, []);

    const handleEditHabit = useCallback((data: HabitEditData) => {
        setSidebarView({ type: "edit-habit", data });
    }, []);

    const handleSuccess = useCallback(() => {
        fetchEvents(currentYear, currentMonth, false);
        closeModal();
    }, [currentYear, currentMonth, fetchEvents, closeModal]);
    //Implement refresh data functionality
    const handleRefresh = useCallback(() => {
        fetchEvents(currentYear, currentMonth, false);
    }, [currentYear, currentMonth, fetchEvents]);

    const handleToggleWeek = useCallback(() => {
        setIsWeekView((prev) => !prev);
    }, []);
    const isModalOpen = sidebarView.type !== "closed";

    return (
        <div className="min-h-screen bg-deep-bg flex">
            <Navbar />
            {isWeekView ? (
                <CalendarWeeklyView
                    allEvents={normalizedAllEvents}
                    goals={goals}
                    onAddTask={handleAddTask}
                    onAddHabit={handleAddHabit}
                    onRefresh={handleRefresh}
                    onToggleWeek={handleToggleWeek}
                    isModalOpen={isModalOpen}
                />
            ) : (
                <CalendarUI
                    events={events}
                    onDateSelect={handleDateSelect}
                    selectedDate={
                        sidebarView.type === "day-info"
                            ? sidebarView.date
                            : undefined
                    }
                    onAddHabit={handleAddHabit}
                    onAddTask={handleAddTask}
                    isModalOpen={isModalOpen}
                    onMonthChange={handleMonthChange}
                    onToggleWeek={handleToggleWeek}
                    isWeekView={isWeekView}
                    isLoading={isLoading}
                />
            )}

            {isModalOpen && (
                <SidebarModal
                    title={getSidebarTitle(sidebarView)}
                    onClose={closeModal}
                >
                    <SidebarContent
                        view={sidebarView}
                        events={events}
                        goals={goals}
                        onSuccess={handleSuccess}
                        onRefresh={handleRefresh}
                        onEditTask={handleEditTask}
                        onEditHabit={handleEditHabit}
                    />
                </SidebarModal>
            )}

            {!isModalOpen && (
                <Button
                    onClick={openAnalytics}
                    className="hidden md:flex h-36 w-10 justify-center items-center fixed [writing-mode:vertical-lr] rotate-180 right-0 top-1/2 -translate-y-1/2 text-base gap-12 rounded-r-[13px] rounded-l-none"
                >
                    STATS
                    <ChevronRight className="w-6 h-6" />
                </Button>
            )}
        </div>
    );
}
