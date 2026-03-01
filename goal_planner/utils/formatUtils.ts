/**
 * Shared formatting utility functions for dates, times, and display values.
 * Used across GoalCard, anual-goals, onboarding, and GoalForm components.
 */

/**
 * Parses a date string (YYYY-MM-DD) as local time to avoid UTC offset issues.
 * Using `new Date("2026-03-07")` parses as UTC midnight, which shifts days
 * in non-UTC timezones. This helper avoids that.
 */
export const parseLocalDate = (dateStr: string): Date => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
};

/** Mapping of full day names to abbreviated forms */
export const DAY_MAP: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
};

/**
 * Formats an array of repeat days into a readable string.
 * @param days - Array of day names (e.g., ["monday", "tuesday"])
 * @returns Formatted string (e.g., "Mon, Tue") or "Everyday" if all 7 days
 */
export const formatRepeatDays = (days: string[]): string | undefined => {
    if (days.length === 7) return "Everyday";
    if (days.length === 0) return undefined;
    return days.map((day) => DAY_MAP[day.toLowerCase()] || day).join(", ");
};

/**
 * Formats a 24h time string to 12-hour format with AM/PM.
 * @param time - Time string in 24-hour format (e.g., "14:30")
 * @returns Formatted time (e.g., "2:30 PM") or undefined if null
 */
export const formatTime = (time: string | null): string | undefined => {
    if (!time) return undefined;
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Formats a date string to short uppercase format (e.g., "15 JAN").
 * Uses local date parsing to avoid UTC timezone offset issues.
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Formatted date or undefined if null
 */
export const formatDateShort = (date: string | null): string | undefined => {
    if (!date) return undefined;
    const d = parseLocalDate(date);
    const day = d.getDate();
    const month = d
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase();
    return `${day} ${month}`;
};

/**
 * Formats a date to long format (e.g., "Jan 15, 2026").
 * Uses local date parsing to avoid UTC timezone offset issues.
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string
 */
export const formatTargetDate = (date: string): string => {
    const d = parseLocalDate(date);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

/**
 * Capitalizes the first letter of a string.
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats a time range as HH:MM-HH:MM.
 * If only start_time is available, returns just HH:MM.
 * @param startTime - Start time in HH:MM:SS or HH:MM format
 * @param endTime - End time in HH:MM:SS or HH:MM format
 * @returns Formatted time range or undefined if no start time
 */
export const formatTimeRange = (
    startTime?: string | null,
    endTime?: string | null,
): string | undefined => {
    if (!startTime) return undefined;
    const start = startTime.slice(0, 5);
    if (!endTime) return start;
    return `${start}-${endTime.slice(0, 5)}`;
};
