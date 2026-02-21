"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import InputField from "@/components/ui/InputField/InputField";
import type { HabitEditData } from "@/types/sidebar";

interface AddHabitProps {
	goalId?: number;
	onClose: () => void;
	onCancel: () => void;
	showGoalSelect?: boolean;
	inline?: boolean;
	editData?: HabitEditData;
	goals?: { id: number; name: string }[];
}

interface Goal {
	id: number;
	name: string;
}

const DAYS = [
	{ id: "monday", label: "M" },
	{ id: "tuesday", label: "T" },
	{ id: "wednesday", label: "W" },
	{ id: "thursday", label: "T" },
	{ id: "friday", label: "F" },
	{ id: "saturday", label: "S" },
	{ id: "sunday", label: "S" },
];

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

	const [goals, setGoals] = useState<Goal[]>(preloadedGoals || []);
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

	const fetchGoals = useCallback(async () => {
		const supabase = createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) return;

		const { data } = await supabase
			.from("goals")
			.select("id, name")
			.eq("user_id", user.id)
			.is("deleted_at", null)
			.order("name");

		if (data) setGoals(data);
	}, []);

	useEffect(() => {
		// Only fetch goals if not preloaded and showGoalSelect is true
		if (showGoalSelect && !preloadedGoals) {
			fetchGoals();
		}
	}, [showGoalSelect, preloadedGoals, fetchGoals]);

	const toggleDay = useCallback((dayId: string) => {
		setSelectedDays((prev) =>
			prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
		);
	}, []);

	const handleSubmit = async () => {
		if (!habitName.trim()) {
			alert("Please enter a habit name");
			return;
		}

		if (selectedDays.length === 0) {
			alert("Please select at least one repeat day");
			return;
		}

		if (!startDate || !endDate) {
			alert("Please select start and end dates");
			return;
		}

		setIsSubmitting(true);

		try {
			const supabase = createClient();

			if (isEditMode && editData) {
				// Update existing habit using RPC function
				const { error } = await supabase.rpc("update_habit_with_repeat_days", {
					p_habit_id: editData.id,
					p_goal_id: selectedGoalId,
					p_name: habitName,
					p_start_date: startDate,
					p_end_date: endDate,
					p_repeat_days: selectedDays,
				});

				if (error) throw error;
			} else {
				// Create new habit using RPC function
				const { error } = await supabase.rpc("create_habit_with_repeat_days", {
					p_goal_id: selectedGoalId,
					p_name: habitName,
					p_start_date: startDate,
					p_end_date: endDate,
					p_repeat_days: selectedDays,
				});

				if (error) throw error;
			}

			onClose();
		} catch (error) {
			console.error("Error saving habit:", error);
			alert("Failed to save habit");
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
							onChange={(e) =>
								setSelectedGoalId(
									e.target.value ? Number(e.target.value) : null,
								)
							}
							className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors">
							<option value="">Not Selected</option>
							{goals.map((goal) => (
								<option key={goal.id} value={goal.id}>
									{goal.name}
								</option>
							))}
						</select>
					</div>
				)}

				{/* Habit Name */}
				<InputField
					label="Habit Name"
					type="text"
					placeholder="Enter habit name"
					value={habitName}
					onChange={(e) => setHabitName(e.target.value)}
					labelClassName="block text-white-pearl mb-2 text-sm"
				/>

				{/* Repeat Days */}
				<div>
					<label className="block text-white-pearl mb-2 text-sm">
						Repeat Days
					</label>
					<div className="flex gap-2 justify-between">
						{DAYS.map((day) => (
							<button
								key={day.id}
								onClick={() => toggleDay(day.id)}
								className={`${
									inline ? "w-10 h-10" : "w-[1.75rem] h-[1.75rem] text-sm"
								} rounded-full font-semibold transition ${
									selectedDays.includes(day.id)
										? "bg-vibrant-orange text-white-pearl"
										: "bg-input-bg text-input-text "
								}`}>
								{day.label}
							</button>
						))}
					</div>
				</div>

				{/* Date Range */}
				<div className={inline ? "grid grid-cols-2 gap-4" : "space-y-4"}>
					<InputField
						label="Start Date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						labelClassName="block text-white-pearl mb-2 text-sm"
					/>
					<InputField
						label="End Date"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						labelClassName="block text-white-pearl mb-2 text-sm"
					/>
				</div>

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
