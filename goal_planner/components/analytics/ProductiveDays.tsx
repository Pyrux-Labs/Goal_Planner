/**
 * Gráfico de actividad diaria — barras apiladas (tareas + hábitos).
 * Tarea 8: solo se usa en /stats, no en el sidebar.
 *
 * compact=true → versión reducida (preparada para futura reutilización)
 * compact=false → versión completa para /stats
 */

import type { DayActivity } from "@/hooks/useAnalyticsData";

interface ProductiveDaysProps {
	dailyActivity: DayActivity[];
	periodLabel: string;
	compact: boolean;
}

/** Etiqueta corta para el eje X */
function dayLabel(dateStr: string, totalDays: number): string {
	const [, , day] = dateStr.split("-");
	if (totalDays <= 7) {
		const d = new Date(dateStr + "T00:00:00");
		return d.toLocaleDateString("en-US", { weekday: "narrow" });
	}
	const n = parseInt(day, 10);
	if (n === 1 || n % 5 === 0) return String(n);
	return "";
}

export default function ProductiveDays({
	dailyActivity,
	periodLabel,
	compact,
}: ProductiveDaysProps) {
	const hasData = dailyActivity.some((d) => d.tasks + d.habits > 0);
	const maxVal = Math.max(...dailyActivity.map((d) => d.tasks + d.habits), 1);
	const barMaxH = compact ? 40 : 72; // px

	return (
		<div
			className={`bg-modal-bg border border-input-bg flex flex-col gap-3 ${compact ? "rounded-2xl p-3" : "rounded-3xl p-5 md:p-6"}`}>
			{/* Título */}
			<div className="flex items-baseline justify-between">
				<span
					className={`text-white-pearl font-medium uppercase tracking-wide ${compact ? "text-sm" : "text-sm"}`}>
					Daily activity
				</span>
				<span
					className={`text-input-text ${compact ? "text-[0.65rem]" : "text-xs"}`}>
					{periodLabel}
				</span>
			</div>

			{!hasData ? (
				<p className="text-input-text text-xs text-center py-4">
					No activity recorded yet for this period
				</p>
			) : (
				<>
					{/* Barras apiladas */}
					<div className="overflow-x-auto">
						<div
							className="flex items-end gap-px"
							style={{
								minWidth:
									dailyActivity.length > 14
										? `${dailyActivity.length * 10}px`
										: "100%",
								height: `${barMaxH + 16}px`,
							}}>
							{dailyActivity.map((day) => {
								const total = day.tasks + day.habits;
								const totalH =
									total > 0
										? Math.max(4, Math.round((total / maxVal) * barMaxH))
										: 3;
								const taskH =
									total > 0 ? Math.round((day.tasks / total) * totalH) : 0;
								const habitH = totalH - taskH;
								const label = dayLabel(day.date, dailyActivity.length);
								const isToday =
									day.date === new Date().toISOString().slice(0, 10);

								return (
									<div
										key={day.date}
										className="flex flex-col items-center gap-0.5 flex-1"
										style={{ minWidth: "8px" }}>
										<div
											className="w-full flex flex-col justify-end"
											style={{ height: `${barMaxH}px` }}>
											{total > 0 ? (
												<div
													className="w-full rounded-sm overflow-hidden flex flex-col"
													style={{ height: `${totalH}px` }}>
													{/* Hábitos (verde, arriba) */}
													{habitH > 0 && (
														<div
															className="w-full"
															style={{
																height: `${habitH}px`,
																backgroundColor: "hsl(146, 50%, 36%)",
															}}
														/>
													)}
													{/* Tareas (naranja, abajo) */}
													{taskH > 0 && (
														<div
															className="w-full"
															style={{
																height: `${taskH}px`,
																backgroundColor: "hsl(20, 95%, 44%)",
															}}
														/>
													)}
												</div>
											) : (
												<div
													className="w-full rounded-sm"
													style={{
														height: "3px",
														backgroundColor: "hsl(13, 23%, 19%)",
													}}
												/>
											)}
										</div>
										{label && (
											<span
												className={`leading-none ${compact ? "text-[0.5rem]" : "text-[0.6rem]"} ${isToday ? "text-vibrant-orange font-bold" : "text-input-text"}`}>
												{label}
											</span>
										)}
									</div>
								);
							})}
						</div>
					</div>

					{/* Leyenda */}
					<div className="flex gap-4">
						<span className="flex items-center gap-1 text-xs text-input-text">
							<span className="w-2.5 h-2.5 rounded-sm bg-vibrant-orange inline-block" />
							Tasks
						</span>
						<span className="flex items-center gap-1 text-xs text-input-text">
							<span className="w-2.5 h-2.5 rounded-sm bg-sea-green inline-block" />
							Habits
						</span>
					</div>
				</>
			)}
		</div>
	);
}
