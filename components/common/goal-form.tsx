import {
	useState,
	forwardRef,
	useImperativeHandle,
	useCallback,
	useEffect,
	useRef,
} from "react";
import ErrorMessage from "@/components/ui/error-message";
import TaskHabitColumn from "@/components/common/task-habit-column";
import InputField from "@/components/ui/input-field";
import CategorySelector from "./category-selector";
import ColorPicker from "./color-picker";
import { CATEGORY_MAP, REVERSE_CATEGORY_MAP } from "@/lib/constants/categories";
import { COLOR_MAP, REVERSE_COLOR_MAP } from "@/lib/constants/colors";
import {
	formatTaskForDisplay,
	formatHabitForDisplay,
} from "@/lib/goal-data-utils";
import {
	validateGoalForm,
	hasErrors as hasGoalErrors,
} from "@/lib/validations/goal-validation";
import {
	fetchGoalById,
	createGoal,
	updateGoal,
	fetchTasksAndHabitsForGoal,
	getCurrentUserId,
} from "@/lib/services/goal-service";
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

				const errors = validateGoalForm({
					goalName,
					selectedCategory,
					startDate,
					targetDate,
					isEditMode,
				});

				if (hasGoalErrors(errors)) {
					if (errors.goalName) setGoalNameError(errors.goalName);
					if (errors.category) setCategoryError(errors.category);
					if (errors.startDate) setStartDateError(errors.startDate);
					if (errors.targetDate) setTargetDateError(errors.targetDate);
					if (errors.dateRange) setDateRangeError(errors.dateRange);
					return null;
				}

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
					<CategorySelector
						selected={selectedCategory}
						onSelect={(name) => {
							setSelectedCategory(name);
							if (categoryError) setCategoryError("");
						}}
						error={categoryError}
						disabled={formDisabled}
					/>
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
						<ColorPicker
							selected={selectedColor}
							onSelect={setSelectedColor}
							disabled={formDisabled}
						/>
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
