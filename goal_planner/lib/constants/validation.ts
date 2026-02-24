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
