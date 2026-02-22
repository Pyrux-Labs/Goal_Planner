"use client";
import { ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import CalendarUI from "@/components/Calendar/CalendarUI/CalendarUI";
import Navbar from "@/components/Layout/Navbar/Navbar";
import SidebarModal from "@/components/ui/SidebarModal/SidebarModal";
import Button from "@/components/ui/Button/Button";
import SidebarContent, {
    getSidebarTitle,
} from "@/components/common/SidebarContent/SidebarContent";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEventsMap, CalendarEvent } from "@/types/calendar";
import type { SidebarView, TaskEditData, HabitEditData } from "@/types/sidebar";

export default function CalendarPage() {
    const [sidebarView, setSidebarView] = useState<SidebarView>({
        type: "closed",
    });
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
    const [goals, setGoals] = useState<{ id: number; name: string }[]>([]);
    const [loadedYearRange, setLoadedYearRange] = useState<{
        start: number;
        end: number;
    } | null>(null);
    const [currentYear, setCurrentYear] = useState<number>(
        new Date().getFullYear(),
    );
    const [currentMonth, setCurrentMonth] = useState<number>(
        new Date().getMonth(),
    );

    // prevent concurrent fetches
    const isFetchingRef = useRef(false);

    // Fetch 3 years (previous, current, next)
    // ~5MB payload is acceptable for instant navigation and edit optimization
    const fetchThreeYears = useCallback(async (centerYear: number) => {
        // prevent concurrent calls
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        const supabase = createClient();
        const startYear = centerYear - 1;
        const endYear = centerYear + 1;

        try {
            const { data, error } = await supabase.rpc(
                "get_user_events_current_month",
                {
                    p_start: `${startYear}-01-01`,
                    p_end: `${endYear}-12-31`,
                },
            );

            if (error) {
                console.error("Error fetching events:", error);
                return;
            }

            // The RPC function returns jsonb_agg which comes as an array
            const eventsData = Array.isArray(data) ? data : data ? [data] : [];
            setAllEvents(eventsData || []);
            setLoadedYearRange({ start: startYear, end: endYear });
        } catch (err) {
            console.error("Unexpected error in fetchThreeYears:", err);
        } finally {
            isFetchingRef.current = false;
        }
    }, []);

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
        fetchThreeYears(new Date().getFullYear());
        fetchGoals();
    }, [fetchThreeYears, fetchGoals]);

    // Re-fetch when year is out of range
    useEffect(() => {
        if (
            loadedYearRange &&
            (currentYear < loadedYearRange.start ||
                currentYear > loadedYearRange.end)
        ) {
            fetchThreeYears(currentYear);
        }
    }, [currentYear, loadedYearRange, fetchThreeYears]);

    const events = useMemo(() => {
        const filtered = allEvents.filter((event) => {
            const [year, month] = event.date.split("-").map(Number);
            return year === currentYear && month - 1 === currentMonth;
        });

        return filtered.reduce((acc: CalendarEventsMap, event) => {
            const dateKey = event.date;
            if (!acc[dateKey]) acc[dateKey] = [];
            acc[dateKey].push(event);
            return acc;
        }, {});
    }, [allEvents, currentYear, currentMonth]);

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
        fetchThreeYears(currentYear);
        closeModal();
    }, [currentYear, fetchThreeYears, closeModal]);
    //Implement refresh data functionality
    const handleRefresh = useCallback(() => {
        fetchThreeYears(currentYear);
    }, [currentYear, fetchThreeYears]);
    const isModalOpen = sidebarView.type !== "closed";

    return (
        <div className="min-h-screen bg-deep-bg flex">
            <Navbar />
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
            />

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
                    className="h-36 w-10 flex justify-center items-center fixed [writing-mode:vertical-lr] rotate-180 right-0 top-1/2 -translate-y-1/2 text-base gap-12 rounded-r-[13px] rounded-l-none"
                >
                    STATS
                    <ChevronRight className="w-6 h-6" />
                </Button>
            )}
        </div>
    );
}
