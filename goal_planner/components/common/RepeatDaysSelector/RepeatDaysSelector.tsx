import { DAYS } from "@/lib/constants/days";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";

interface RepeatDaysSelectorProps {
	selectedDays: string[];
	onToggle: (dayId: string) => void;
	error?: string;
	inline?: boolean;
}

export default function RepeatDaysSelector({
	selectedDays,
	onToggle,
	error,
	inline = false,
}: RepeatDaysSelectorProps) {
	return (
		<div>
			<label className="block text-white-pearl mb-2 text-sm">Repeat Days</label>
			<div className="flex gap-2 justify-between">
				{DAYS.map((day) => (
					<button
						key={day.id}
						onClick={() => onToggle(day.id)}
						className={`${
							inline
								? "w-10 h-10"
								: "!w-7 !h-7 min-w-0 min-h-0 aspect-square text-[11px] p-0 leading-none"
						} rounded-full font-semibold transition flex items-center justify-center shrink-0 ${
							selectedDays.includes(day.id)
								? "bg-vibrant-orange text-white-pearl"
								: "bg-input-bg text-input-text"
						}`}>
						{day.label}
					</button>
				))}
			</div>
			{error && <ErrorMessage message={error} />}
		</div>
	);
}
