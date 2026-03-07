import { createClient } from "@/lib/supabase/client";

export async function signInWithPassword(email: string, password: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
}

export async function signInWithGoogle(redirectUrl: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
    });
    if (error) throw error;
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
}

export async function checkUserHasGoals(): Promise<boolean> {
    const supabase = createClient();
    const { count } = await supabase
        .from("goals")
        .select("id", { count: "exact", head: true })
        .limit(1);
    return (count ?? 0) > 0;
}

/** Get the current authenticated user */
export async function getUser() {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

/** Get current user's ID or throw */
export async function requireUserId(): Promise<string> {
    const user = await getUser();
    if (!user) throw new Error("Not authenticated");
    return user.id;
}

/** Sign up with email/password */
export async function signUp(
    email: string,
    password: string,
    fullName: string,
    emailRedirectTo: string,
) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName },
            emailRedirectTo,
        },
    });
    if (error) throw error;
    return data;
}

/** Sign up with Google OAuth */
export async function signUpWithGoogle(redirectUrl: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
    });
    if (error) throw error;
}

/** Upsert a row in the users table (for auto-confirmed signups) */
export async function upsertUserRow(
    id: string,
    fullname: string,
    email: string,
) {
    const supabase = createClient();
    const { error } = await supabase.from("users").upsert(
        {
            id,
            fullname,
            email,
            profile_picture:
                "https://jbfzvoxddrydtawekviz.supabase.co/storage/v1/object/public/profile_pictures/default.jpg",
        },
        { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) throw error;
}

/** Verify OTP for email signup */
export async function verifyOtp(email: string, token: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
    });
    if (error) throw error;
}

/** Resend signup OTP */
export async function resendSignUpOtp(
    email: string,
    emailRedirectTo: string,
) {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo },
    });
    if (error) throw error;
}

/** Send password reset email */
export async function resetPasswordForEmail(
    email: string,
    redirectTo: string,
) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
    });
    if (error) throw error;
}

/** Update the current user's password */
export async function updatePassword(newPassword: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) throw error;
}

/** Exchange an auth code for a session */
export async function exchangeCodeForSession(code: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
}

/** Set session from tokens (recovery flow) */
export async function setSession(
    accessToken: string,
    refreshToken: string,
) {
    const supabase = createClient();
    const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    if (error) throw error;
}

/** Get current session */
export async function getSession() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session;
}

/** Delete the current user's own account via RPC */
export async function deleteOwnAccount() {
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) throw error;
    await supabase.auth.signOut();
}
