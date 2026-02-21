import { ReactNode } from "react";
import Button from "../Button/Button";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop borroso */}
            <div
                className="absolute inset-0 bg-deep-bg/80 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-modal-bg rounded-3xl border-[3px] border-vibrant-orange shadow-lg shadow-vibrant-orange/50 px-8 py-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-white-pearl font-title text-2xl font-semibold mb-3">
                        {title}
                    </h2>
                    <div className="text-input-text text-base leading-relaxed">
                        {message}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="bg-input-bg hover:bg-input-bg/80"
                    >
                        {cancelText}
                    </Button>
                    <Button onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
