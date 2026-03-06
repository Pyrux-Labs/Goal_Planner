import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent } from "@/types/calendar";

/** Fetch calendar events for a date range via RPC */
export async function fetchCalendarEvents(
    startDate: string,
    endDate: string,
): Promise<CalendarEvent[]> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc(
        "get_user_events_current_month",
        { p_start: startDate, p_end: endDate },
    );

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }

    return Array.isArray(data) ? data : data ? [data] : [];
}
