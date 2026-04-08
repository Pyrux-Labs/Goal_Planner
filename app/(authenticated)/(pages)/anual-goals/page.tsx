"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Top from "@/components/layout/top";
import GoalCard from "@/components/common/goal-card";
import GoalCardSkeleton from "@/components/common/goal-card-skeleton";
import Modal from "@/components/ui/modal";
import { useGoalsData } from "@/hooks/use-goals-data";
import { useGoalDeletion } from "@/hooks/use-goal-deletion";
import { formatGoalForDisplay } from "@/lib/goal-data-utils";
import { ROUTES } from "@/lib/constants/routes";
import {
	getCurrentUserId,
	fetchUnassignedItems,
} from "@/lib/services/goal-service";
import type { UnassignedItem } from "@/types/goal";
import { formatRepeatDays } from "@/lib/format-utils";
import TaskHabitColumn from "@/components/common/task-habit-column";
import type { TaskHabitItem } from "@/types/task";
import { deleteTaskCompletely } from "@/lib/services/task-service";
import { deleteHabitCompletely } from "@/lib/services/habit-service";
import { useToast } from "@/components/ui/toast-context";
import GoalsStatisticsBar from "@/components/anual-goals/goals-statistics-bar";
import GoalsFilters, { type GoalFilterType } from "@/components/anual-goals/goals-filters";

// ===== COMPONENT =====
export default function AnualGoalsPage() {
	const router = useRouter();
	const [selectedFilter, setSelectedFilter] = useState<GoalFilterType>("all");
	const { showToast } = useToast();

	const {
		goals,
		loading,
		overallProgress,
		activeCount,
		completedCount,
		refetch,
	} = useGoalsData();

	const {
		isDeleteModalOpen,
		goalToDelete,
		isDeleting,
		handleDeleteClick,
		handleConfirmDelete,
		handleCancelDelete,
		handleTaskDelete,
		handleHabitDelete,
	} = useGoalDeletion(refetch);

	// Unassigned tasks/habits state
	const [unassignedItems, setUnassignedItems] = useState<UnassignedItem[]>([]);
	const [unassignedLoading, setUnassignedLoading] = useState(false);

	const fetchUnassigned = useCallback(async () => {
		setUnassignedLoading(true);
		try {
			const userId = await getCurrentUserId();
			const items = await fetchUnassignedItems(userId);
			setUnassignedItems(items);
		} catch (error) {
			console.error("Error fetching unassigned items:", error);
		} finally {
			setUnassignedLoading(false);
		}
	}, []);

	useEffect(() => {
		if (selectedFilter === "unassigned") {
			fetchUnassigned();
		}
	}, [selectedFilter, fetchUnassigned]);

	const handleDeleteUnassigned = useCallback(
		async (item: UnassignedItem) => {
			const result =
				item.type === "task"
					? await deleteTaskCompletely(item.id)
					: await deleteHabitCompletely(item.id);

			if (result.success) {
				showToast(
					`${item.type === "task" ? "Task" : "Habit"} deleted`,
					"success",
				);
				fetchUnassigned();
			} else {
				showToast(`Failed to delete ${item.type}`, "error");
			}
		},
		[fetchUnassigned, showToast],
	);

	// ===== FILTERED & FORMATTED DATA =====
	const filteredFormattedGoals = useMemo(() => {
		if (selectedFilter === "unassigned") return [];

		const filtered = goals.filter((g) => {
			if (selectedFilter === "all") return true;
			const isCompleted = g.progress >= 100;
			return selectedFilter === "completed" ? isCompleted : !isCompleted;
		});

		const sorted = filtered.sort((a, b) => {
			const aCompleted = a.progress >= 100 ? 1 : 0;
			const bCompleted = b.progress >= 100 ? 1 : 0;
			return aCompleted - bCompleted;
		});

		return sorted.map(formatGoalForDisplay);
	}, [goals, selectedFilter]);

	const unassignedTaskItems = useMemo<TaskHabitItem[]>(
		() =>
			unassignedItems
				.filter((i) => i.type === "task")
				.map((item) => ({
					title: item.name,
					days: formatRepeatDays(item.repeat_days),
					editData: {
						id: item.id,
						goal_id: null,
						name: item.name,
						start_date: item.start_date,
						end_date: item.end_date,
						start_time: item.start_time,
						end_time: item.end_time,
						repeat_days: item.repeat_days,
						is_repeating: item.is_repeating,
					},
				})),
		[unassignedItems],
	);
	const unassignedHabitItems = useMemo<TaskHabitItem[]>(
		() =>
			unassignedItems
				.filter((i) => i.type === "habit")
				.map((item) => ({
					title: item.name,
					days: formatRepeatDays(item.repeat_days),
					editData: {
						id: item.id,
						goal_id: null,
						name: item.name,
						start_date: item.start_date ?? "",
						end_date: item.end_date ?? "",
						repeat_days: item.repeat_days,
					},
				})),
		[unassignedItems],
	);

	const handleNewGoal = useCallback(
		() => router.push(ROUTES.NEW_GOAL),
		[router],
	);

	// ===== RENDER =====
	return (
		<>
			<Top
				title="My Goals"
				buttons={[{ text: "New Goal", onClick: handleNewGoal }]}
			/>

			<GoalsStatisticsBar
				activeCount={activeCount}
				completedCount={completedCount}
				overallProgress={overallProgress}
			/>

			<GoalsFilters selected={selectedFilter} onChange={setSelectedFilter} />

			{/* Content */}
			{selectedFilter === "unassigned" ? (
				<div className="max-w-[70rem] mx-auto">
					{unassignedLoading ? (
						<div className="text-white-pearl text-center py-8">Loading...</div>
					) : unassignedItems.length === 0 ? (
						<div className="text-white-pearl text-center py-8">
							No unassigned tasks or habits found.
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
							{/* Tasks Column */}
							<TaskHabitColumn
								type="task"
								items={unassignedTaskItems}
								onAdd={fetchUnassigned}
								onDelete={(index) => {
									const item = unassignedItems.filter((i) => i.type === "task")[
										index
									];
									if (item) handleDeleteUnassigned(item);
								}}
							/>
							{/* Habits Column */}
							<TaskHabitColumn
								type="habit"
								items={unassignedHabitItems}
								onAdd={fetchUnassigned}
								onDelete={(index) => {
									const item = unassignedItems.filter(
										(i) => i.type === "habit",
									)[index];
									if (item) handleDeleteUnassigned(item);
								}}
							/>
						</div>
					)}
				</div>
			) : (
				<div className="space-y-6 max-w-[70rem] mx-auto">
					{loading ? (
						<>
							<GoalCardSkeleton />
							<GoalCardSkeleton />
							<GoalCardSkeleton />
						</>
					) : filteredFormattedGoals.length === 0 ? (
						<div className="text-white-pearl text-center py-8">
							No goals found. Create your first goal!
						</div>
					) : (
						filteredFormattedGoals.map((goal) => (
							<GoalCard
								key={goal.id}
								goalId={goal.id}
								title={goal.name}
								description={goal.description || goal.categoryName}
								progress={goal.progress}
								targetDate={goal.formattedDate}
								category={goal.categoryName}
								tasks={goal.formattedTasks}
								habits={goal.formattedHabits}
								onTaskAdd={() => refetch()}
								onHabitAdd={() => refetch()}
								onTaskDelete={(taskIndex) => {
									const task = goal.tasks[taskIndex];
									if (task) handleTaskDelete(task.id, task.name);
								}}
								onHabitDelete={(habitIndex) => {
									const habit = goal.habits[habitIndex];
									if (habit) handleHabitDelete(habit.id, habit.name);
								}}
								onEdit={() => router.push(`/edit-goal?id=${goal.id}`)}
								onDelete={() => handleDeleteClick(goal.id, goal.name)}
							/>
						))
					)}
				</div>
			)}

			<Modal
				isOpen={isDeleteModalOpen}
				title="Delete Goal?"
				message={
					<>
						Are you sure you want to delete{" "}
						<strong className="text-white-pearl">{goalToDelete?.name}</strong>?
						This will permanently delete the goal and all associated tasks,
						habits, and their logs. This action cannot be undone.
					</>
				}
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				onClose={handleCancelDelete}
				isLoading={isDeleting}
				maxWidth="md"
			/>
		</>
	);
}
