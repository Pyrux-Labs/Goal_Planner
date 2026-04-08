"use client";
import { useState, useCallback } from "react";
import InputField from "@/components/ui/input-field";
import ErrorMessage from "@/components/ui/error-message";
import { useFetchGoals } from "@/hooks/use-fetch-goals";
import type { HabitEditData } from "@/types/sidebar";
import RepeatDaysSelector from "@/components/common/repeat-days-selector";
import DateRangeInput from "@/components/common/date-range-input";
import {
	validateHabitForm,
	hasErrors as hasHabitErrors,
} from "@/lib/validations/habit-validation";
import {
	createHabitWithRepeatDays,
	updateHabitWithRepeatDays,
} from "@/lib/services/habit-service";

interface AddHabitProps {
	goalId?: number;
	onClose: () => void;
	onCancel: () => void;
	showGoalSelect?: boolean;
	inline?: boolean;
	editData?: HabitEditData;
	goals?: { id: number; name: string }[];
}

const AddHabit = ({
	goalId,
	onClose,
	onCancel,
	showGoalSelect = false,
	inline = false,
	editData,
	goals: preloadedGoals,
}: AddHabitProps) => {
	const isEditMode = !!editData;

	const { goals } = useFetchGoals({
		preloadedGoals,
		enabled: showGoalSelect,
	});
	const [selectedGoalId, setSelectedGoalId] = useState<number | null>(
		editData?.goal_id ?? goalId ?? null,
	);
	const [habitName, setHabitName] = useState(editData?.name ?? "");
	const [selectedDays, setSelectedDays] = useState<string[]>(
		editData?.repeat_days ?? [],
	);
	const [startDate, setStartDate] = useState(editData?.start_date ?? "");
	const [endDate, setEndDate] = useState(editData?.end_date ?? "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Error states
	const [goalError, setGoalError] = useState("");
	const [habitNameError, setHabitNameError] = useState("");
	const [repeatDaysError, setRepeatDaysError] = useState("");
	const [dateRangeError, setDateRangeError] = useState("");
	const [generalError, setGeneralError] = useState("");

	const toggleDay = useCallback((dayId: string) => {
		setSelectedDays((prev) =>
			prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
		);
	}, []);

	const handleSubmit = async () => {
		// Clear all errors
		setGoalError("");
		setHabitNameError("");
		setRepeatDaysError("");
		setDateRangeError("");
		setGeneralError("");

		const errors = validateHabitForm({
			habitName,
			selectedDays,
			startDate,
			endDate,
			isEditMode,
		});

		if (hasHabitErrors(errors)) {
			if (errors.habitName) setHabitNameError(errors.habitName);
			if (errors.repeatDays) setRepeatDaysError(errors.repeatDays);
			if (errors.dateRange) setDateRangeError(errors.dateRange);
			return;
		}

		setIsSubmitting(true);

		try {
			if (isEditMode && editData) {
				await updateHabitWithRepeatDays({
					habitId: editData.id,
					goalId: selectedGoalId,
					name: habitName,
					startDate: startDate,
					endDate: endDate,
					repeatDays: selectedDays,
				});
			} else {
				await createHabitWithRepeatDays({
					goalId: selectedGoalId,
					name: habitName,
					startDate: startDate,
					endDate: endDate,
					repeatDays: selectedDays,
				});
			}

			onClose();
		} catch (error) {
			console.error("Error saving habit:", error);
			setGeneralError("Failed to save habit. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className={
				inline
					? "bg-modal-bg rounded-3xl border-2 border-vibrant-orange/30 p-6"
					: "space-y-4 px-4"
			}>
			{inline && (
				<h2 className="text-white-pearl font-title text-2xl font-semibold mb-4">
					{isEditMode ? "Edit Habit" : "Add Habit"}
				</h2>
			)}

			<div className="space-y-4">
				{/* Goal Select */}
				{showGoalSelect && (
					<div>
						<label className="block text-white-pearl mb-2 text-sm">
							Select Goal
						</label>
						<select
							value={selectedGoalId || ""}
							onChange={(e) => {
								setSelectedGoalId(
									e.target.value ? Number(e.target.value) : null,
								);
								if (goalError) setGoalError("");
							}}
							className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors">
							<option value="">Not Selected</option>
							{goals.map((goal) => (
								<option key={goal.id} value={goal.id}>
									{goal.name}
								</option>
							))}
						</select>
						{goalError && <ErrorMessage message={goalError} />}
					</div>
				)}

				{/* Habit Name */}
				<div>
					<InputField
						label="Habit Name"
						type="text"
						placeholder="Enter habit name"
						value={habitName}
						onChange={(e) => {
							setHabitName(e.target.value);
							if (habitNameError) setHabitNameError("");
						}}
						labelClassName="block text-white-pearl mb-2 text-sm"
					/>
					{habitNameError && <ErrorMessage message={habitNameError} />}
				</div>

				{/* Repeat Days */}
				<RepeatDaysSelector
					selectedDays={selectedDays}
					onToggle={(dayId) => {
						toggleDay(dayId);
						if (repeatDaysError) setRepeatDaysError("");
					}}
					error={repeatDaysError}
					inline={inline}
				/>

				{/* Date Range */}
				<DateRangeInput
					startDate={startDate}
					endDate={endDate}
					onStartDateChange={(val) => {
						setStartDate(val);
						if (dateRangeError) setDateRangeError("");
					}}
					onEndDateChange={(val) => {
						setEndDate(val);
						if (dateRangeError) setDateRangeError("");
					}}
					error={dateRangeError}
					inline={inline}
				/>

				{/* General Error */}
				{generalError && (
					<ErrorMessage message={generalError} variant="general" />
				)}

				{/* Buttons */}
				<div className="flex gap-3 pt-2">
					{inline && (
						<button
							onClick={onCancel}
							className="flex-1 h-10 rounded-xl bg-input-bg text-white-pearl font-medium hover:bg-input-bg/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={isSubmitting}>
							Cancel
						</button>
					)}
					<button
						onClick={handleSubmit}
						className={
							inline
								? "flex-1 h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
								: "w-full h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed "
						}
						disabled={isSubmitting}>
						{isSubmitting
							? isEditMode
								? "Updating..."
								: "Adding..."
							: isEditMode
								? "Update Habit"
								: "Add Habit"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddHabit;
