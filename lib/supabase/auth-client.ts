import { createClient } from "@supabase/supabase-js";

// Simple client for the auth flow (password reset)
// Uses localStorage as per the official Supabase documentation
export const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
