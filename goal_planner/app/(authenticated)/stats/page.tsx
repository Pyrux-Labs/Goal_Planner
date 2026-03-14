"use client";

import { useState } from "react";
import Top from "@/components/Layout/Top/Top";
import {
	useAnalyticsData,
	type AnalyticsPeriod,
} from "@/hooks/useAnalyticsData";
import CompletionDonut from "@/components/analytics/CompletionDonut";
import StreakCard from "@/components/analytics/StreakCard";
import ProductiveDays from "@/components/analytics/ProductiveDays";

// ===== PERIOD TABS =====

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
	{ id: "weekly", label: "This week" },
	{ id: "monthly", label: "This month" },
	{ id: "all", label: "All time" },
];

// ===== SKELETON =====

function Skeleton() {
	return (
		<div className="space-y-4">
			{[1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className="bg-modal-bg border border-input-bg rounded-3xl p-6 h-28 animate-pulse"
				/>
			))}
		</div>
	);
}

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

			{/* Period selector */}
			<div className="flex gap-6 md:gap-10 border-b-2 border-input-bg pb-4 mb-6 md:mb-8 font-medium text-white-pearl">
				{PERIODS.map(({ id, label }) => (
					<span
						key={id}
						onClick={() => setPeriod(id)}
						className={`cursor-pointer border-b-2 pb-1 transition-colors duration-200 ${
							period === id
								? "text-vibrant-orange border-vibrant-orange"
								: "border-transparent hover:text-vibrant-orange hover:border-vibrant-orange"
						}`}>
						{label}
					</span>
				))}
			</div>

			{error && <div className="text-carmin text-center py-4">{error}</div>}

			{loading ? (
				<Skeleton />
			) : (
				<div className="space-y-4 max-w-4xl">
					{/* Tarea 7 — Donut charts (tareas + hábitos) */}
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

					{/* Streak */}
					<StreakCard
						current={streak.current}
						best={streak.best}
						compact={false}
					/>

					{/*Daily activity chart */}
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
