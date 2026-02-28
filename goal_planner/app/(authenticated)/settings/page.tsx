"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Top from "@/components/Layout/Top/Top";
import Modal from "@/components/ui/Modal/Modal";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast/ToastContext";
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
    const [bulkDeleteTarget, setBulkDeleteTarget] =
        useState<BulkDeleteTarget | null>(null);
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
            const supabase = createClient();
            const { error } = await supabase.rpc("delete_own_account");

            if (error) {
                console.error("Error deleting account:", error);
                showToast(`Error deleting account: ${error.message}`, "error");
                setIsDeleting(false);
                return;
            }

            await supabase.auth.signOut();
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
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Helper: get IDs then delete repeat_days via parent FK
            const deleteRepeatDaysByParent = async (
                parentTable: "tasks" | "habits",
                repeatTable: "task_repeat_days" | "habit_repeat_days",
                fkColumn: "task_id" | "habit_id",
            ) => {
                const { data: parents } = await supabase
                    .from(parentTable)
                    .select("id")
                    .eq("user_id", user.id);
                const ids = (parents || []).map((p: { id: number }) => p.id);
                if (ids.length > 0) {
                    const { error } = await supabase
                        .from(repeatTable)
                        .delete()
                        .in(fkColumn, ids);
                    if (error) throw error;
                }
            };

            if (bulkDeleteTarget === "tasks" || bulkDeleteTarget === "goals") {
                await deleteRepeatDaysByParent(
                    "tasks",
                    "task_repeat_days",
                    "task_id",
                );
                const { error } = await supabase
                    .from("task_logs")
                    .delete()
                    .eq("user_id", user.id);
                if (error) throw error;
                const { error: e2 } = await supabase
                    .from("tasks")
                    .delete()
                    .eq("user_id", user.id);
                if (e2) throw e2;
            }

            if (bulkDeleteTarget === "habits" || bulkDeleteTarget === "goals") {
                await deleteRepeatDaysByParent(
                    "habits",
                    "habit_repeat_days",
                    "habit_id",
                );
                const { error } = await supabase
                    .from("habit_logs")
                    .delete()
                    .eq("user_id", user.id);
                if (error) throw error;
                const { error: e2 } = await supabase
                    .from("habits")
                    .delete()
                    .eq("user_id", user.id);
                if (e2) throw e2;
            }

            if (bulkDeleteTarget === "goals") {
                const { error } = await supabase
                    .from("goals")
                    .delete()
                    .eq("user_id", user.id);
                if (error) throw error;
            }

            showToast(
                `All ${bulkDeleteTarget} deleted successfully.`,
                "success",
            );
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
        if (bulkDeleteTarget === "account") {
            handleDeleteAccount();
        } else {
            handleBulkDelete();
        }
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
                {/* Danger Zone */}
                <div className="bg-modal-bg border border-carmin/40 rounded-3xl p-6 md:p-8">
                    <h2 className="text-white-pearl font-title text-xl font-semibold mb-2">
                        Danger Zone
                    </h2>
                    <p className="text-input-text text-sm mb-6">
                        Irreversible actions that affect your data permanently.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => openBulkDelete("tasks")}
                            className="flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-carmin/10 text-carmin border border-carmin/30 rounded-xl hover:bg-carmin/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete All Tasks
                        </button>
                        <button
                            onClick={() => openBulkDelete("habits")}
                            className="flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-carmin/10 text-carmin border border-carmin/30 rounded-xl hover:bg-carmin/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete All Habits
                        </button>
                        <button
                            onClick={() => openBulkDelete("goals")}
                            className="flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-carmin/10 text-carmin border border-carmin/30 rounded-xl hover:bg-carmin/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete All Goals (+ Tasks & Habits)
                        </button>

                        <hr className="border-carmin/20 my-4" />

                        <button
                            onClick={() => openBulkDelete("account")}
                            className="flex items-center gap-2 px-5 py-2.5 bg-carmin/20 text-carmin border border-carmin/40 rounded-xl hover:bg-carmin/30 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
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
