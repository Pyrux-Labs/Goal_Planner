"use client";

import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import CompletionDonut from "@/components/analytics/CompletionDonut";
import StreakCard from "@/components/analytics/StreakCard";
import ProductiveDays from "@/components/analytics/ProductiveDays";

interface CalendarAnalyticsProps {
	isWeekView: boolean;
	currentYear: number;
	currentMonth: number;
}

function Skeleton() {
	return (
		<div className="flex flex-col gap-3 p-1">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className="bg-modal-bg rounded-2xl border border-input-bg h-24 animate-pulse"
				/>
			))}
		</div>
	);
}

export default function CalendarAnalytics({
	isWeekView,
	currentYear,
	currentMonth,
}: CalendarAnalyticsProps) {
	const period = isWeekView ? "weekly" : "monthly";

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
	} = useAnalyticsData(period, currentYear, currentMonth);

	if (loading) return <Skeleton />;

	if (error) {
		return <div className="p-4 text-carmin text-xs text-center">{error}</div>;
	}

	return (
		<div className="flex flex-col gap-3 p-1">
			{/* Card 1: Combined completion donut */}
			<div className="bg-modal-bg rounded-2xl p-3 border border-input-bg">
				<p className="text-white-pearl text-sm uppercase tracking-wide mb-3">
					Completion · {isWeekView ? "this week" : "this month"}
				</p>
				<div className="flex justify-center">
					<CompletionDonut
						label="Tasks & Habits"
						completed={tasksCompleted + habitsCompleted}
						total={
							tasksCompleted + tasksPending + habitsCompleted + habitsPending
						}
						color="hsl(20, 95%, 44%)"
						compact={true}
					/>
				</div>
			</div>

			{/* Card 2: Streak */}
			<StreakCard current={streak.current} best={streak.best} compact={true} />

			{/* Card 3: Daily activity (efficiency graph) */}
			<ProductiveDays
				dailyActivity={dailyActivity}
				periodLabel={periodLabel}
				compact={true}
			/>
		</div>
	);
}
