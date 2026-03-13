"use client";
import { useState, useEffect, useCallback } from "react";
import InputField from "@/components/ui/InputField/InputField";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import { useFetchGoals } from "@/hooks/useFetchGoals";
import type { TaskEditData } from "@/types/sidebar";
import RepeatDaysSelector from "@/components/common/RepeatDaysSelector/RepeatDaysSelector";
import DateRangeInput from "@/components/common/DateRangeInput/DateRangeInput";
import {
	validateTaskForm,
	hasErrors as hasTaskErrors,
} from "@/lib/validations/taskValidation";
import {
	createTaskWithRepeatDays,
	updateTaskWithRepeatDays,
} from "@/lib/services/taskService";

interface AddTaskProps {
	goalId?: number;
	onClose: () => void;
	onCancel: () => void;
	showGoalSelect?: boolean;
	inline?: boolean;
	editData?: TaskEditData;
	goals?: { id: number; name: string }[];
}

const AddTask = ({
	goalId,
	onClose,
	onCancel,
	showGoalSelect = false,
	inline = false,
	editData,
	goals: preloadedGoals,
}: AddTaskProps) => {
	const isEditMode = !!editData;

	const { goals } = useFetchGoals({
		preloadedGoals,
		enabled: showGoalSelect,
	});
	const [selectedGoalId, setSelectedGoalId] = useState<number | null>(
		editData?.goal_id ?? goalId ?? null,
	);
	const [taskName, setTaskName] = useState(editData?.name ?? "");
	const [taskType, setTaskType] = useState<"one-time" | "repeating">(
		editData?.is_repeating ? "repeating" : "one-time",
	);
	const [selectedDate, setSelectedDate] = useState(editData?.edit_date ?? "");
	const [selectedDays, setSelectedDays] = useState<string[]>(
		editData?.repeat_days ?? [],
	);
	const [startDate, setStartDate] = useState(editData?.start_date ?? "");
	const [endDate, setEndDate] = useState(editData?.end_date ?? "");
	const [isAllDay, setIsAllDay] = useState(!editData?.start_time);
	const [startTime, setStartTime] = useState(editData?.start_time ?? "");
	const [endTime, setEndTime] = useState(editData?.end_time ?? "");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Error states
	const [goalError, setGoalError] = useState("");
	const [taskNameError, setTaskNameError] = useState("");
	const [repeatDaysError, setRepeatDaysError] = useState("");
	const [dateRangeError, setDateRangeError] = useState("");
	const [dateError, setDateError] = useState("");
	const [startTimeError, setStartTimeError] = useState("");
	const [endTimeError, setEndTimeError] = useState("");
	const [generalError, setGeneralError] = useState("");

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onCancel();
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [onCancel]);

	const toggleDay = useCallback((dayId: string) => {
		setSelectedDays((prev) =>
			prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
		);
	}, []);

	const handleSubmit = async () => {
		// Clear all errors
		setGoalError("");
		setTaskNameError("");
		setRepeatDaysError("");
		setDateRangeError("");
		setDateError("");
		setStartTimeError("");
		setEndTimeError("");
		setGeneralError("");

		const errors = validateTaskForm({
			taskName,
			taskType,
			selectedDays,
			startDate,
			endDate,
			selectedDate,
			isAllDay,
			startTime,
			isEditMode,
		});

		if (hasTaskErrors(errors)) {
			if (errors.taskName) setTaskNameError(errors.taskName);
			if (errors.repeatDays) setRepeatDaysError(errors.repeatDays);
			if (errors.dateRange) setDateRangeError(errors.dateRange);
			if (errors.date) setDateError(errors.date);
			if (errors.startTime) setStartTimeError(errors.startTime);
			return;
		}

		setIsSubmitting(true);

		try {
			if (isEditMode && editData) {
				await updateTaskWithRepeatDays({
					taskId: editData.id,
					goalId: selectedGoalId,
					name: taskName,
					startDate: taskType === "repeating" ? startDate : null,
					endDate: taskType === "repeating" ? endDate : null,
					startTime: !isAllDay ? startTime : null,
					endTime: !isAllDay && endTime ? endTime : null,
					repeatDays: taskType === "repeating" ? selectedDays : [],
				});
			} else {
				await createTaskWithRepeatDays({
					goalId: selectedGoalId,
					name: taskName,
					startDate: taskType === "repeating" ? startDate : null,
					endDate: taskType === "repeating" ? endDate : null,
					startTime: !isAllDay ? startTime : null,
					endTime: !isAllDay && endTime ? endTime : null,
					isOneTime: taskType === "one-time",
					oneTimeDate:
						taskType === "one-time" && selectedDate ? selectedDate : null,
					repeatDays: taskType === "repeating" ? selectedDays : [],
				});
			}

			onClose();
		} catch (error) {
			console.error("Error saving task:", error);
			setGeneralError("Failed to save task. Please try again.");
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
					{isEditMode ? "Edit Task" : "Add Task"}
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

				{/* Task Name */}
				<div>
					<InputField
						label="Task Name"
						type="text"
						placeholder="Enter task name"
						value={taskName}
						onChange={(e) => {
							setTaskName(e.target.value);
							if (taskNameError) setTaskNameError("");
						}}
						labelClassName="block text-white-pearl mb-2 text-sm"
					/>
					{taskNameError && <ErrorMessage message={taskNameError} />}
				</div>

				{/* Task Type Switch */}
				<div>
					<label className="block text-white-pearl mb-2 text-sm">
						Task Type
					</label>
					<div className="flex gap-2">
						<button
							onClick={() => setTaskType("one-time")}
							className={`flex-1 h-10 rounded-xl font-medium transition ${
								taskType === "one-time"
									? "bg-vibrant-orange text-white-pearl"
									: "bg-input-bg text-input-text"
							}`}>
							One-Time
						</button>
						<button
							onClick={() => setTaskType("repeating")}
							className={`flex-1 h-10 rounded-xl font-medium transition ${
								taskType === "repeating"
									? "bg-vibrant-orange text-white-pearl"
									: "bg-input-bg text-input-text"
							}`}>
							Repeating
						</button>
					</div>
				</div>

				{/* One-Time: Date */}
				{taskType === "one-time" && (
					<div>
						<InputField
							label="Date (Optional)"
							type="date"
							value={selectedDate}
							onChange={(e) => {
								setSelectedDate(e.target.value);
								if (dateError) setDateError("");
							}}
							labelClassName="block text-white-pearl mb-2 text-sm"
						/>
						{dateError && <ErrorMessage message={dateError} />}
					</div>
				)}

				{/* Repeating: Repeat Days and Date Range */}
				{taskType === "repeating" && (
					<>
						<RepeatDaysSelector
							selectedDays={selectedDays}
							onToggle={(dayId) => {
								toggleDay(dayId);
								if (repeatDaysError) setRepeatDaysError("");
							}}
							error={repeatDaysError}
							inline={inline}
						/>

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
					</>
				)}

				{/* All Day Task Checkbox */}
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="allDay"
						checked={isAllDay}
						onChange={(e) => setIsAllDay(e.target.checked)}
						className="w-4 h-4 accent-vibrant-orange"
					/>
					<label htmlFor="allDay" className="text-white-pearl text-sm">
						All Day Task
					</label>
				</div>

				{/* Time Range (if not all day) */}
				{!isAllDay && (
					<div className={inline ? "grid grid-cols-2 gap-4" : "space-y-4"}>
						<div>
							<label className="block text-white-pearl mb-2 text-sm">
								Start Time
							</label>
							<input
								type="time"
								value={startTime}
								onChange={(e) => {
									setStartTime(e.target.value);
									if (startTimeError) setStartTimeError("");
								}}
								className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors"
							/>
							{startTimeError && <ErrorMessage message={startTimeError} />}
						</div>
						<div>
							<label className="block text-white-pearl mb-2 text-sm">
								End Time{" "}
								<span className="text-input-text text-xs">(Optional)</span>
							</label>
							<input
								type="time"
								value={endTime}
								onChange={(e) => {
									setEndTime(e.target.value);
									if (endTimeError) setEndTimeError("");
								}}
								className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors"
							/>
							{endTimeError && <ErrorMessage message={endTimeError} />}
						</div>
					</div>
				)}

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
								: "w-full h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
						}
						disabled={isSubmitting}>
						{isSubmitting
							? isEditMode
								? "Updating..."
								: "Adding..."
							: isEditMode
								? "Update Task"
								: "Add Task"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AddTask;
