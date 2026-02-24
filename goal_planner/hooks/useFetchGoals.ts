/**
 * Custom hook for fetching the list of user goals.
 * Eliminates duplicate fetchGoals logic in AddTask and AddHabit components.
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Goal {
	id: number;
	name: string;
}

interface UseFetchGoalsOptions {
	/** Pre-loaded goals to use instead of fetching */
	preloadedGoals?: Goal[];
	/** Whether to fetch goals on mount (default: true) */
	enabled?: boolean;
}

export function useFetchGoals({
	preloadedGoals,
	enabled = true,
}: UseFetchGoalsOptions = {}) {
	const [goals, setGoals] = useState<Goal[]>(preloadedGoals || []);

	const fetchGoals = useCallback(async () => {
		const supabase = createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) return;

		const { data } = await supabase
			.from("goals")
			.select("id, name")
			.eq("user_id", user.id)
			.is("deleted_at", null)
			.order("name");

		if (data) setGoals(data);
	}, []);

	useEffect(() => {
		if (enabled && !preloadedGoals) {
			fetchGoals();
		}
	}, [enabled, preloadedGoals, fetchGoals]);

	return { goals, refetchGoals: fetchGoals };
}
