/**
 * Custom hook for goal, task, and habit deletion logic.
 * Consolidates deletion handlers used in anual-goals and onboarding.
 */

import { useState, useCallback } from "react";
import { deleteGoalWithRelatedData } from "@/lib/services/goal-service";
import { deleteTaskWithFutureLogs } from "@/lib/services/task-service";
import { deleteHabitWithFutureLogs } from "@/lib/services/habit-service";
import { useToast } from "@/components/ui/toast-context";

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
    const { showToast, showConfirm } = useToast();

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
            showToast("Goal deleted successfully", "success");
            await onDeleteSuccess();
        } else {
            showToast(`Failed to delete goal: ${result.error}`, "error");
        }
    }, [goalToDelete, onDeleteSuccess, showToast]);

    const handleCancelDelete = useCallback(() => {
        setIsDeleteModalOpen(false);
        setGoalToDelete(null);
    }, []);

    const handleTaskDelete = useCallback(
        async (taskId: number, taskName: string): Promise<boolean> => {
            return new Promise((resolve) => {
                showConfirm(
                    `Are you sure you want to delete "${taskName}"? This will delete the task and all its logs from today onwards.`,
                    async () => {
                        const result = await deleteTaskWithFutureLogs(taskId);
                        if (result.success) {
                            showToast("Task deleted successfully", "success");
                            await onDeleteSuccess();
                            resolve(true);
                        } else {
                            showToast(
                                `Failed to delete task: ${result.error}`,
                                "error",
                            );
                            resolve(false);
                        }
                    },
                    {
                        title: "Delete Task",
                        confirmText: "Delete",
                        cancelText: "Cancel",
                    },
                );
            });
        },
        [onDeleteSuccess, showConfirm, showToast],
    );

    const handleHabitDelete = useCallback(
        async (habitId: number, habitName: string): Promise<boolean> => {
            return new Promise((resolve) => {
                showConfirm(
                    `Are you sure you want to delete "${habitName}"? This will delete the habit and all its logs from today onwards.`,
                    async () => {
                        const result = await deleteHabitWithFutureLogs(habitId);
                        if (result.success) {
                            showToast("Habit deleted successfully", "success");
                            await onDeleteSuccess();
                            resolve(true);
                        } else {
                            showToast(
                                `Failed to delete habit: ${result.error}`,
                                "error",
                            );
                            resolve(false);
                        }
                    },
                    {
                        title: "Delete Habit",
                        confirmText: "Delete",
                        cancelText: "Cancel",
                    },
                );
            });
        },
        [onDeleteSuccess, showConfirm, showToast],
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
