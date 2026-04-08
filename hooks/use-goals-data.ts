/**
 * Custom hook for fetching and managing goals data.
 * Consolidates the data fetching logic used in anual-goals and onboarding.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { getUser } from "@/lib/services/auth-service";
import {
    fetchAllGoalsData,
    calculateYearProgress,
    formatGoalForDisplay,
} from "@/lib/goal-data-utils";
import type { GoalWithDetails, FormattedGoal } from "@/types/goal";

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
            const user = await getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const goalsWithDetails = await fetchAllGoalsData(user.id);
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
