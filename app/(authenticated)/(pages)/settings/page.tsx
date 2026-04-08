"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Top from "@/components/layout/top";
import Modal from "@/components/ui/modal";
import DangerZone from "@/components/settings/danger-zone";
import { deleteOwnAccount, requireUserId } from "@/lib/services/auth-service";
import {
  bulkDeleteUserTasks,
  bulkDeleteUserHabits,
  bulkDeleteUserGoals,
} from "@/lib/services/goal-service";
import { useToast } from "@/components/ui/toast-context";
import { ROUTES } from "@/lib/constants/routes";

type BulkDeleteTarget = "tasks" | "habits" | "goals" | "account";

const BULK_DELETE_LABELS: Record<
  Exclude<BulkDeleteTarget, "account">,
  { label: string; message: string }
> = {
  tasks: {
    label: "Delete All Tasks",
    message:
      "Are you sure you want to delete ALL your tasks? This will permanently remove every task and its logs. This action cannot be undone.",
  },
  habits: {
    label: "Delete All Habits",
    message:
      "Are you sure you want to delete ALL your habits? This will permanently remove every habit and its logs. This action cannot be undone.",
  },
  goals: {
    label: "Delete All Goals",
    message:
      "Are you sure you want to delete ALL your goals and their associated tasks and habits? This will permanently remove everything. This action cannot be undone.",
  },
};

export default function SettingsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<BulkDeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const openBulkDelete = (target: BulkDeleteTarget) => {
    setBulkDeleteTarget(target);
    setShowDeleteModal(true);
  };

  const closeBulkDelete = () => {
    setShowDeleteModal(false);
    setBulkDeleteTarget(null);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteOwnAccount();
      showToast("Account deleted successfully.", "success");
      router.push(ROUTES.LANDING);
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast(
        `Error deleting account: ${error instanceof Error ? error.message : "Please try again."}`,
        "error",
      );
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkDeleteTarget || bulkDeleteTarget === "account") return;

    setIsDeleting(true);
    try {
      const userId = await requireUserId();

      if (bulkDeleteTarget === "tasks") await bulkDeleteUserTasks(userId);
      else if (bulkDeleteTarget === "habits") await bulkDeleteUserHabits(userId);
      else if (bulkDeleteTarget === "goals") await bulkDeleteUserGoals(userId);

      showToast(`All ${bulkDeleteTarget} deleted successfully.`, "success");
      closeBulkDelete();
    } catch (error) {
      console.error(`Error deleting ${bulkDeleteTarget}:`, error);
      showToast(
        `Error deleting ${bulkDeleteTarget}: ${error instanceof Error ? error.message : "Please try again."}`,
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirm = () => {
    if (bulkDeleteTarget === "account") handleDeleteAccount();
    else handleBulkDelete();
  };

  const modalMessage =
    bulkDeleteTarget === "account"
      ? "Are you sure you want to delete your account? All your goals, tasks, habits and progress will be permanently removed. This action cannot be undone."
      : bulkDeleteTarget
        ? BULK_DELETE_LABELS[bulkDeleteTarget].message
        : "";

  const modalTitle =
    bulkDeleteTarget === "account"
      ? "Delete Account"
      : bulkDeleteTarget
        ? `Delete All ${bulkDeleteTarget.charAt(0).toUpperCase() + bulkDeleteTarget.slice(1)}`
        : "";

  return (
    <>
      <Top title="Settings" />
      <div className="max-w-2xl mx-auto mt-8 space-y-6">
        <DangerZone onDelete={openBulkDelete} />
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={closeBulkDelete}
        title={modalTitle}
        message={modalMessage}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={closeBulkDelete}
        isLoading={isDeleting}
        maxWidth="sm"
      />
    </>
  );
}
