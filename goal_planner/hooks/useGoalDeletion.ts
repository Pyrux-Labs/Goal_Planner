/**
 * Custom hook for goal, task, and habit deletion logic.
 * Consolidates deletion handlers used in anual-goals and onboarding.
 */

import { useState, useCallback } from "react";
import { deleteGoalWithRelatedData } from "@/utils/deleteGoal";
import {
    deleteTaskWithFutureLogs,
    deleteHabitWithFutureLogs,
} from "@/utils/deleteTaskHabit";

interface UseGoalDeletionReturn {
    isDeleteModalOpen: boolean;
    goalToDelete: { id: number; name: string } | null;
    isDeleting: boolean;
    handleDeleteClick: (goalId: number, goalName: string) => void;
    handleConfirmDelete: () => Promise<void>;
    handleCancelDelete: () => void;
    handleTaskDelete: (taskId: number, taskName: string) => Promise<boolean>;
    handleHabitDelete: (habitId: number, habitName: string) => Promise<boolean>;
}

export function useGoalDeletion(
    onDeleteSuccess: () => Promise<void>,
): UseGoalDeletionReturn {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = useCallback(
        (goalId: number, goalName: string) => {
            setGoalToDelete({ id: goalId, name: goalName });
            setIsDeleteModalOpen(true);
        },
        [],
    );

    const handleConfirmDelete = useCallback(async () => {
        if (!goalToDelete) return;
        setIsDeleting(true);
        const result = await deleteGoalWithRelatedData(goalToDelete.id);
        setIsDeleting(false);

        if (result.success) {
            setIsDeleteModalOpen(false);
            setGoalToDelete(null);
            await onDeleteSuccess();
        } else {
            alert(`Failed to delete goal: ${result.error}`);
        }
    }, [goalToDelete, onDeleteSuccess]);

    const handleCancelDelete = useCallback(() => {
        setIsDeleteModalOpen(false);
        setGoalToDelete(null);
    }, []);

    const handleTaskDelete = useCallback(
        async (taskId: number, taskName: string): Promise<boolean> => {
            const confirmed = window.confirm(
                `Are you sure you want to delete "${taskName}"? This will delete the task and all its logs from today onwards.`,
            );
            if (!confirmed) return false;

            const result = await deleteTaskWithFutureLogs(taskId);
            if (result.success) {
                await onDeleteSuccess();
                return true;
            }
            alert(`Failed to delete task: ${result.error}`);
            return false;
        },
        [onDeleteSuccess],
    );

    const handleHabitDelete = useCallback(
        async (habitId: number, habitName: string): Promise<boolean> => {
            const confirmed = window.confirm(
                `Are you sure you want to delete "${habitName}"? This will delete the habit and all its logs from today onwards.`,
            );
            if (!confirmed) return false;

            const result = await deleteHabitWithFutureLogs(habitId);
            if (result.success) {
                await onDeleteSuccess();
                return true;
            }
            alert(`Failed to delete habit: ${result.error}`);
            return false;
        },
        [onDeleteSuccess],
    );

    return {
        isDeleteModalOpen,
        goalToDelete,
        isDeleting,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
        handleTaskDelete,
        handleHabitDelete,
    };
}
