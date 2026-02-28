"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface UserData {
    id: string;
    fullname: string;
    email: string;
    profile_picture: string;
}

interface UserContextType {
    user: UserData | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    user: null,
    loading: true,
    refresh: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async () => {
        const supabase = createClient();
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
            setUser(null);
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from("users")
            .select("id, fullname, email, profile_picture")
            .eq("id", authUser.id)
            .single();

        if (data) {
            setUser(data);
        } else {
            // User row doesn't exist — create it so FK constraints work
            const DEFAULT_PP =
                "https://jbfzvoxddrydtawekviz.supabase.co/storage/v1/object/public/profile_pictures/default.jpg";
            const newUser: UserData = {
                id: authUser.id,
                fullname:
                    authUser.user_metadata?.full_name || authUser.email || "",
                email: authUser.email || "",
                profile_picture: DEFAULT_PP,
            };
            await supabase.from("users").upsert(newUser, {
                onConflict: "id",
                ignoreDuplicates: true,
            });
            setUser(newUser);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUserData();

        const supabase = createClient();
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                fetchUserData();
            } else if (event === "SIGNED_OUT") {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchUserData]);

    return (
        <UserContext.Provider value={{ user, loading, refresh: fetchUserData }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser(): UserContextType {
    return useContext(UserContext);
}
