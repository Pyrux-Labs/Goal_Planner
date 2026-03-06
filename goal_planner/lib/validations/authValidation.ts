/**
 * Authentication-related validation functions.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
