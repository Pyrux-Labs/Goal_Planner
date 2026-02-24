/**
 * Utility functions for date formatting and manipulation
 */

import type { CalendarEvent } from "@/types/calendar";

/**
 * Converts a Date object to a YYYY-MM-DD string key
 * This is the standard format used for CalendarEventsMap keys
 */
export const getDateKey = (date: Date): string => {
    return date.toISOString().split("T")[0];
};

/**
 * Alternative name for consistency with existing code
 */
export const formatDateKey = getDateKey;

/**
 * Checks if two dates represent the same calendar day.
 */
export const isSameDay = (a: Date, b: Date): boolean => {
    return (
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear()
    );
};

/**
 * Sorts calendar events by time, then by ID for stable ordering.
 * Reused across CalendarInfo, CalendarWeeklyView, and any future event displays.
 */
export const sortEventsByTime = (events: CalendarEvent[]): CalendarEvent[] => {
    return [...events].sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;
        return a.id - b.id;
    });
};

/**
 * Groups events into a map keyed by date string, sorted within each day.
 */
export const buildSortedEventsMap = (
    events: CalendarEvent[],
): Record<string, CalendarEvent[]> => {
    const eventsMap: Record<string, CalendarEvent[]> = {};

    events.forEach((event) => {
        const dateKey = event.date;
        if (!eventsMap[dateKey]) eventsMap[dateKey] = [];
        eventsMap[dateKey].push(event);
    });

    Object.keys(eventsMap).forEach((dateKey) => {
        eventsMap[dateKey] = sortEventsByTime(eventsMap[dateKey]);
    });

    return eventsMap;
};
