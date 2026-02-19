/**
 * Utility functions for date formatting and manipulation
 */

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
