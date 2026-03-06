import {
	useState,
	forwardRef,
	useImperativeHandle,
	useCallback,
	useEffect,
	useRef,
} from "react";
import Image from "next/image";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import TaskHabitColumn from "../TaskHabitColumn/TaskHabitColumn";
import InputField from "../../ui/InputField/InputField";
import {
	categories,
	colors,
	CATEGORY_MAP,
	REVERSE_CATEGORY_MAP,
} from "@/lib/constants/categories";
import { COLOR_MAP, REVERSE_COLOR_MAP } from "@/lib/constants/colors";
import { getTodayDateString } from "@/lib/constants/validation";
import {
	formatTaskForDisplay,
	formatHabitForDisplay,
} from "@/utils/goalDataUtils";
import {
	fetchGoalById,
	createGoal,
	updateGoal,
	fetchTasksAndHabitsForGoal,
	getCurrentUserId,
} from "@/lib/services/goalService";
import type { Task, Habit } from "@/types/goal";

export interface GoalFormRef {
	saveGoal: () => Promise<number | null>;
	scrollToTasksHabits: () => void;
}

interface GoalFormProps {
	goalId?: number | null;
	onGoalCreated?: (goalId: number) => void;
}

const GoalForm = forwardRef<GoalFormRef, GoalFormProps>(
	({ goalId: initialGoalId, onGoalCreated }, ref) => {
		const [goalId, setGoalId] = useState<number | null>(initialGoalId || null);
		const [goalName, setGoalName] = useState("");
		const [description, setDescription] = useState("");
		const [selectedCategory, setSelectedCategory] = useState("");
		const [selectedColor, setSelectedColor] = useState("#D94E06");
		const [startDate, setStartDate] = useState("");
		const [targetDate, setTargetDate] = useState("");
		const [isSaving, setIsSaving] = useState(false);
		const [tasks, setTasks] = useState<Task[]>([]);
		const [habits, setHabits] = useState<Habit[]>([]);

		// Ref for tasks and habits section
		const tasksHabitsRef = useRef<HTMLDivElement>(null);

		// Error states
		const [goalNameError, setGoalNameError] = useState("");
		const [categoryError, setCategoryError] = useState("");
		const [startDateError, setStartDateError] = useState("");
		const [targetDateError, setTargetDateError] = useState("");
		const [dateRangeError, setDateRangeError] = useState("");
		const [generalError, setGeneralError] = useState("");

		const isEditMode = !!initialGoalId;

		// Load existing goal data if in edit mode
		useEffect(() => {
			if (initialGoalId) {
				loadGoalData(initialGoalId);
			}
		}, [initialGoalId]);

		const loadGoalData = async (id: number) => {
			try {
				const goalData = await fetchGoalById(id);

				setGoalName(goalData.name || "");
				setDescription(goalData.description || "");
				setSelectedCategory(REVERSE_CATEGORY_MAP[goalData.category] || "Skill");
				setSelectedColor(REVERSE_COLOR_MAP[goalData.color] || "#D94E06");
				setStartDate(goalData.start_date || "");
				setTargetDate(goalData.target_date || "");

				await fetchTasksAndHabits(id);
			} catch (error: unknown) {
				console.error("Error loading goal data:", error);
				setGeneralError(
					error instanceof Error ? error.message : "Failed to load goal data",
				);
			}
		};

		const fetchTasksAndHabits = useCallback(async (currentGoalId: number) => {
			try {
				const result = await fetchTasksAndHabitsForGoal(currentGoalId);
				setTasks(result.tasks);
				setHabits(result.habits);
			} catch (error) {
				console.error("Error fetching tasks and habits:", error);
			}
		}, []);

		useImperativeHandle(ref, () => ({
			saveGoal: async () => {
				// Clear all errors
				setGoalNameError("");
				setCategoryError("");
				setStartDateError("");
				setTargetDateError("");
				setDateRangeError("");
				setGeneralError("");

				let hasErrors = false;

				// Validation
				if (!goalName.trim()) {
					setGoalNameError("Please enter a goal name");
					hasErrors = true;
				}

				if (!selectedCategory) {
					setCategoryError("Please select a category");
					hasErrors = true;
				}

				if (!startDate) {
					setStartDateError("Please select a start date");
					hasErrors = true;
				}

				if (!targetDate) {
					setTargetDateError("Please select a target date");
					hasErrors = true;
				}

				// Validate start date is not in the past (only for new goals)
				if (!isEditMode && startDate) {
					const todayStr = getTodayDateString();
					if (startDate < todayStr) {
						setStartDateError("Start date cannot be in the past");
						hasErrors = true;
					}
				}

				// Validate date range
				if (startDate && targetDate && targetDate <= startDate) {
					setDateRangeError("Target date must be after start date");
					hasErrors = true;
				}

				if (hasErrors) return null;

				setIsSaving(true);

				try {
					const userId = await getCurrentUserId();

					const goalData = {
						name: goalName,
						description: description || null,
						category: CATEGORY_MAP[selectedCategory] || "skill",
						color: COLOR_MAP[selectedColor] || "orange",
						start_date: startDate,
						target_date: targetDate,
					};

					let resultGoalId: number;

					if (isEditMode && goalId) {
						await updateGoal(goalId, goalData);
						resultGoalId = goalId;
					} else {
						const goal = await createGoal(userId, goalData);
						resultGoalId = goal.id;
						setGoalId(resultGoalId);

						if (onGoalCreated) {
							onGoalCreated(resultGoalId);
						}
					}

					await fetchTasksAndHabits(resultGoalId);

					return resultGoalId;
				} catch (error: unknown) {
					console.error(
						`Error ${isEditMode ? "updating" : "creating"} goal:`,
						error,
					);
					setGeneralError(
						error instanceof Error
							? error.message
							: `Failed to ${isEditMode ? "update" : "create"} goal. Please try again.`,
					);
					return null;
				} finally {
					setIsSaving(false);
				}
			},
			scrollToTasksHabits: () => {
				if (tasksHabitsRef.current) {
					tasksHabitsRef.current.scrollIntoView({
						behavior: "smooth",
						block: "start",
					});
				}
			},
		}));

		const formDisabled = isSaving || (!isEditMode && goalId !== null);

		return (
			<div className="py-4 px-2 md:px-4">
				<div className="bg-modal-bg p-4 md:p-8 border border-input-bg rounded-3xl shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)] mb-8">
					{/* Category Selection */}
					<div className="mb-8">
						<label className="block text-white-pearl mb-4">
							SELECT CATEGORY
						</label>
						<div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-0 justify-items-center">
							{categories.map((category) => (
								<button
									key={category.name}
									onClick={() => {
										setSelectedCategory(category.name);
										if (categoryError) setCategoryError("");
									}}
									disabled={formDisabled}
									className={`relative h-16 w-16 md:h-24 md:w-24 flex items-center justify-center rounded-2xl md:rounded-3xl transition-all ${
										selectedCategory === category.name
											? "bg-vibrant-orange shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)]"
											: "bg-input-bg hover:shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)]"
									} ${formDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
									<div className="absolute top-[38%] -translate-y-1/2">
										<Image
											src={category.icon}
											alt={category.name}
											width={36}
											height={36}
											className={`w-5 h-5 md:w-9 md:h-9 object-contain transition-colors ${
												selectedCategory === category.name
													? "filter brightness-0 invert"
													: ""
											}`}
										/>
									</div>
									<span className="absolute bottom-1 md:bottom-3 text-[10px] md:text-xs text-white-pearl">
										{category.name}
									</span>
								</button>
							))}
						</div>
						{categoryError && (
							<ErrorMessage
								message={categoryError}
								className="text-xs text-carmin flex items-center gap-1 mt-2"
							/>
						)}
					</div>
					{/* Goal Name and Description */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-9 mb-8">
						<div>
							<InputField
								label="GOAL NAME"
								placeholder="Master UI Design"
								value={goalName}
								onChange={(e) => {
									setGoalName(e.target.value);
									if (goalNameError) setGoalNameError("");
								}}
								disabled={formDisabled}
							/>
							{goalNameError && <ErrorMessage message={goalNameError} />}
						</div>
						<InputField
							label="DESCRIPTION"
							placeholder="Describe your goal"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							disabled={formDisabled}
						/>
					</div>
					{/* Date and Color Selection */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-9 mb-4">
						<div>
							<InputField
								label="START DATE"
								type="date"
								value={startDate}
								onChange={(e) => {
									setStartDate(e.target.value);
									if (startDateError) setStartDateError("");
									if (dateRangeError) setDateRangeError("");
								}}
								disabled={formDisabled}
							/>
							{startDateError && <ErrorMessage message={startDateError} />}
						</div>
						<div>
							<InputField
								label="TARGET DATE"
								type="date"
								value={targetDate}
								onChange={(e) => {
									setTargetDate(e.target.value);
									if (targetDateError) setTargetDateError("");
									if (dateRangeError) setDateRangeError("");
								}}
								disabled={formDisabled}
							/>
							{targetDateError && <ErrorMessage message={targetDateError} />}
							{dateRangeError && <ErrorMessage message={dateRangeError} />}
						</div>
						<div>
							<label className="block text-white-pearl mb-4">COLOR TAG</label>
							<div className="flex items-center gap-2 w-full h-12">
								{colors.map((color) => (
									<button
										key={color}
										onClick={() => setSelectedColor(color)}
										disabled={formDisabled}
										className={`w-6 h-6 rounded-full transition-all ${
											selectedColor === color ? "scale-110" : "hover:scale-110"
										} ${formDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
										style={{
											backgroundColor: color,
											boxShadow:
												selectedColor === color
													? `0 0 10px 2px ${color}80`
													: "none",
										}}
									/>
								))}
							</div>
						</div>
					</div>

					{/* General Error */}
					{generalError && (
						<ErrorMessage
							message={generalError}
							variant="general"
							className="flex items-center gap-2 text-carmin text-sm mt-4"
						/>
					)}
				</div>

				{/* Tasks and Daily Habits - Only show if goal is created or in edit mode */}
				{(goalId || isEditMode) && (
					<div
						ref={tasksHabitsRef}
						className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14">
						<TaskHabitColumn
							type="task"
							items={tasks.map((task) =>
								formatTaskForDisplay(task, goalId || initialGoalId || 0),
							)}
							goalId={goalId || initialGoalId || 0}
							onAdd={() => fetchTasksAndHabits(goalId || initialGoalId || 0)}
							onDelete={() => fetchTasksAndHabits(goalId || initialGoalId || 0)}
						/>
						<TaskHabitColumn
							type="habit"
							items={habits.map((habit) =>
								formatHabitForDisplay(habit, goalId || initialGoalId || 0),
							)}
							goalId={goalId || initialGoalId || 0}
							onAdd={() => fetchTasksAndHabits(goalId || initialGoalId || 0)}
							onDelete={() => fetchTasksAndHabits(goalId || initialGoalId || 0)}
						/>
					</div>
				)}

				{/* Message when goal is not created yet in create mode */}
				{!goalId && !isEditMode && (
					<div className="text-center py-8 text-input-text">
						<p className="text-lg">Click "Save Goal" to continue</p>
					</div>
				)}
			</div>
		);
	},
);

GoalForm.displayName = "GoalForm";

export default GoalForm;
