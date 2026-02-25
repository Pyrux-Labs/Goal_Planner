/**
 * Centralized route definitions.
 * Prevents hardcoded route strings scattered across the codebase.
 */
export const ROUTES = {
    LANDING: "/landing",
    CALENDAR: "/calendar",
    GOALS: "/anual-goals",
    NEW_GOAL: "/new-goal",
    EDIT_GOAL: "/edit-goal",
    STATS: "/stats",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    REGISTER: "/register",
    VERIFY: "/verify",
    FORGOT_PASSWORD: "/forgot-password",
    CHANGE_PASSWORD: "/change-password",
    ONBOARDING: "/onboarding",
} as const;

/** Routes accessible without authentication */
export const PUBLIC_ROUTES = [
    "/",
    ROUTES.LANDING,
    ROUTES.REGISTER,
    ROUTES.VERIFY,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.CHANGE_PASSWORD,
] as const;

/** Auth-only routes that authenticated users should be redirected away from */
export const AUTH_ONLY_ROUTES = [
    ROUTES.LANDING,
    ROUTES.REGISTER,
    ROUTES.VERIFY,
    ROUTES.FORGOT_PASSWORD,
] as const;

/** Redirect timeout in ms (e.g., after session expiry) */
export const REDIRECT_DELAY_MS = 3000;
