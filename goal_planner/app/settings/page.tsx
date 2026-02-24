"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Top from "@/components/Layout/Top/Top";
import Modal from "@/components/ui/Modal/Modal";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast/ToastContext";

export default function SettingsPage() {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

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

            showToast("Account deleted successfully.", "success");
            router.push("/landing");
        } catch (error) {
            console.error("Error deleting account:", error);
            showToast(
                `Error deleting account: ${error instanceof Error ? error.message : "Please try again."}`,
                "error",
            );
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-deep-bg">
            <Navbar />
            <div className="ml-0 md:ml-14 lg:ml-14 xl:ml-16 2xl:ml-20 mr-4 md:mr-7 p-4 md:p-6 pb-20 md:pb-6">
                <Top title="Settings" />
                <div className="max-w-2xl mx-auto mt-8 space-y-6">
                    {/* Danger Zone */}
                    <div className="bg-modal-bg border border-carmin/40 rounded-3xl p-6 md:p-8">
                        <h2 className="text-white-pearl font-title text-xl font-semibold mb-2">
                            Danger Zone
                        </h2>
                        <p className="text-input-text text-sm mb-6">
                            Irreversible actions that affect your account
                            permanently.
                        </p>

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-carmin/20 text-carmin border border-carmin/40 rounded-xl hover:bg-carmin/30 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Account"
                message="Are you sure you want to delete your account? All your goals, tasks, habits and progress will be permanently removed. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteModal(false)}
                isLoading={isDeleting}
                maxWidth="sm"
            />
        </div>
    );
}
