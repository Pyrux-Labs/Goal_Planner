import InputField from "@/components/ui/InputField/InputField";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";

interface DateRangeInputProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (value: string) => void;
	onEndDateChange: (value: string) => void;
	error?: string;
	inline?: boolean;
}

export default function DateRangeInput({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	error,
	inline = false,
}: DateRangeInputProps) {
	return (
		<div>
			<div className={inline ? "grid grid-cols-2 gap-4" : "space-y-4"}>
				<InputField
					label="Start Date"
					type="date"
					value={startDate}
					onChange={(e) => onStartDateChange(e.target.value)}
					labelClassName="block text-white-pearl mb-2 text-sm"
				/>
				<InputField
					label="End Date"
					type="date"
					value={endDate}
					onChange={(e) => onEndDateChange(e.target.value)}
					labelClassName="block text-white-pearl mb-2 text-sm"
				/>
			</div>
			{error && <ErrorMessage message={error} />}
		</div>
	);
}
