/**
 * Tarjeta de racha de actividad.
 * compact=true → sidebar
 * compact=false → /stats (card completa con borde)
 */

import { Flame, Trophy } from "lucide-react";

interface StreakCardProps {
	current: number;
	best: number;
	compact: boolean;
}

export default function StreakCard({
	current,
	best,
	compact,
}: StreakCardProps) {
	const isMilestone = current === 7 || current === 14 || current === 30;

	const inner = (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-2">
				<Flame
					className={`text-vibrant-orange flex-shrink-0 ${isMilestone ? "gp-flame-milestone" : ""}`}
					size={compact ? 36 : 52}
				/>
				<div>
					<div
						className={`font-bold font-title text-vibrant-orange leading-none ${compact ? "text-2xl" : "text-4xl"}`}>
						{current}
					</div>
					<div className="text-input-text text-xs mt-0.5">
						{current === 1 ? "day" : "days"} in a row
					</div>
				</div>
			</div>
			<div className="text-right">
				<div className="text-input-text text-xs mb-0.5">Best streak</div>
				<div
					className={`font-bold text-white-pearl leading-none flex items-center gap-1 justify-end ${compact ? "text-lg" : "text-2xl"}`}>
					{best}
					<Trophy className="text-vibrant-orange" size={compact ? 16 : 20} />
				</div>
				<div className="text-input-text text-xs mt-0.5">days</div>
			</div>
		</div>
	);

	if (compact) {
		return (
			<div className="bg-modal-bg rounded-2xl p-3 border border-input-bg">
				<p className="text-white-pearl text-sm uppercase tracking-wide mb-2">
					Current streak
				</p>
				{inner}
			</div>
		);
	}

	return (
		<div className="bg-modal-bg border border-input-bg rounded-3xl p-5 md:p-6 flex flex-col gap-4">
			<span className="text-white-pearl text-sm font-medium uppercase tracking-wide">
				Activity streak · last 90 days
			</span>
			{inner}
			<p className="text-input-text text-xs">
				Consecutive days with at least one completed task or habit
			</p>
		</div>
	);
}
