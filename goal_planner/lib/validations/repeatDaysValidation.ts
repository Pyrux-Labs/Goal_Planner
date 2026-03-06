/**
 * Shared validation for repeat-day date ranges.
 * Used by taskValidation and habitValidation.
 */

/** Map JS day-of-week index (0=Sun) to day names used in repeat_days */
const JS_DAY_TO_NAME: Record<number, string> = {
	0: "sunday",
	1: "monday",
	2: "tuesday",
	3: "wednesday",
	4: "thursday",
	5: "friday",
	6: "saturday",
};

/**
 * Validates that a date range + repeat days combination will produce
 * at least one log entry. Returns an error message or null if valid.
 *
 * @param startDate - YYYY-MM-DD
 * @param endDate   - YYYY-MM-DD
 * @param repeatDays - Array of day names (e.g., ["monday", "saturday"])
 */
export function validateRepeatDaysInRange(
	startDate: string,
	endDate: string,
	repeatDays: string[],
): string | null {
	if (!startDate || !endDate || repeatDays.length === 0) return null;

	const [sy, sm, sd] = startDate.split("-").map(Number);
	const [ey, em, ed] = endDate.split("-").map(Number);
	const start = new Date(sy, sm - 1, sd);
	const end = new Date(ey, em - 1, ed);

	const repeatSet = new Set(repeatDays.map((d) => d.toLowerCase()));

	for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
		const dayName = JS_DAY_TO_NAME[d.getDay()];
		if (repeatSet.has(dayName)) return null;
	}

	const SHORT: Record<string, string> = {
		monday: "Mon",
		tuesday: "Tue",
		wednesday: "Wed",
		thursday: "Thu",
		friday: "Fri",
		saturday: "Sat",
		sunday: "Sun",
	};
	const dayNames = repeatDays
		.map((d) => SHORT[d.toLowerCase()] || d)
		.join(", ");
	return `The selected dates don't include any ${dayNames}. Please adjust the date range or repeat days.`;
}
