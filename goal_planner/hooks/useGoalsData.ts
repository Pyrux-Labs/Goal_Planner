/**
 * Custom hook for fetching and managing goals data.
 * Consolidates the data fetching logic used in anual-goals and onboarding.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    fetchAllGoalsData,
    calculateYearProgress,
    formatGoalForDisplay,
    type GoalWithDetails,
    type FormattedGoal,
} from "@/utils/goalDataUtils";

interface UseGoalsDataReturn {
    goals: GoalWithDetails[];
    formattedGoals: FormattedGoal[];
    loading: boolean;
    overallProgress: number;
    activeCount: number;
    completedCount: number;
    refetch: () => Promise<void>;
}

export function useGoalsData(): UseGoalsDataReturn {
    const [goals, setGoals] = useState<GoalWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [overallProgress, setOverallProgress] = useState(0);

    const fetchGoalsData = useCallback(async () => {
        try {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const goalsWithDetails = await fetchAllGoalsData(supabase, user.id);
            setGoals(goalsWithDetails);
            setOverallProgress(calculateYearProgress(goalsWithDetails));
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGoalsData();
    }, [fetchGoalsData]);

    const formattedGoals = useMemo(
        () => goals.map(formatGoalForDisplay),
        [goals],
    );

    const { activeCount, completedCount } = useMemo(
        () => ({
            activeCount: goals.filter((g) => g.progress < 100).length,
            completedCount: goals.filter((g) => g.progress >= 100).length,
        }),
        [goals],
    );

    return {
        goals,
        formattedGoals,
        loading,
        overallProgress,
        activeCount,
        completedCount,
        refetch: fetchGoalsData,
    };
}
