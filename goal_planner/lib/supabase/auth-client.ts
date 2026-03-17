import { createClient } from "@supabase/supabase-js";

// Cliente simple para el flujo de auth (reset de contraseña)
// Usa localStorage igual que la documentación oficial de Supabase
export const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
