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
