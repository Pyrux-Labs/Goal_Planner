"use client";

import { useState } from "react";
import Top from "@/components/layout/top";
import { useAnalyticsData, type AnalyticsPeriod } from "@/hooks/use-analytics-data";
import CompletionDonut from "@/components/analytics/completion-donut";
import StreakCard from "@/components/analytics/streak-card";
import ProductiveDays from "@/components/analytics/productive-days";
import StatsPeriodSelector from "@/components/stats/stats-period-selector";
import StatsLoadingSkeleton from "@/components/stats/stats-loading-skeleton";

export default function StatsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("monthly");
  const {
    tasksCompleted,
    tasksPending,
    habitsCompleted,
    habitsPending,
    dailyActivity,
    streak,
    periodLabel,
    loading,
    error,
  } = useAnalyticsData(period);

  return (
    <>
      <Top title="Statistics" />

      <StatsPeriodSelector selected={period} onChange={setPeriod} />

      {error && <div className="text-carmin text-center py-4">{error}</div>}

      {loading ? (
        <StatsLoadingSkeleton />
      ) : (
        <div className="space-y-4 max-w-4xl">
          <div className="bg-modal-bg border border-input-bg rounded-3xl p-5 md:p-6">
            <span className="text-white-pearl text-sm font-medium uppercase tracking-wide block mb-6">
              Completion · {periodLabel}
            </span>
            <div className="flex justify-around">
              <CompletionDonut
                label="Tasks"
                completed={tasksCompleted}
                total={tasksCompleted + tasksPending}
                color="hsl(20, 95%, 44%)"
                compact={false}
              />
              <CompletionDonut
                label="Habits"
                completed={habitsCompleted}
                total={habitsCompleted + habitsPending}
                color="hsl(146, 50%, 36%)"
                compact={false}
              />
            </div>
          </div>

          <StreakCard current={streak.current} best={streak.best} compact={false} />

          <ProductiveDays
            dailyActivity={dailyActivity}
            periodLabel={periodLabel}
            compact={false}
          />
        </div>
      )}
    </>
  );
}
