/**
 * Shared validation utilities for forms across the application.
 */

/** Email regex pattern */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Password requirements regex: at least one uppercase, one lowercase, one number */
const PASSWORD_STRENGTH_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

/**
 * Validates an email address format.
 * @returns Error message or null if valid
 */
export function validateEmail(email: string): string | null {
    if (!email) return "Email is required";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
    return null;
}

/**
 * Validates password strength requirements.
 * @returns Error message or null if valid
 */
export function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!PASSWORD_STRENGTH_REGEX.test(password)) {
        return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    return null;
}

/**
 * Validates that two passwords match.
 * @returns Error message or null if valid
 */
export function validatePasswordMatch(
    password: string,
    confirmPassword: string,
): string | null {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
}

/**
 * Gets today's date in YYYY-MM-DD format using local timezone.
 * Avoids UTC-based toISOString() which can cause off-by-one date errors.
 */
export function getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

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
        if (repeatSet.has(dayName)) return null; // at least one match found
    }

    // Build readable list of selected days
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
