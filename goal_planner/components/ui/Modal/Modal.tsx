import { ReactNode } from "react";
import Button from "../Button/Button";

interface ModalProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl";
    // Dialog mode props (optional)
    isOpen?: boolean;
    onClose?: () => void;
    message?: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

const Modal = ({
    title,
    subtitle,
    children,
    className = "",
    maxWidth = "lg",
    isOpen,
    onClose,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
}: ModalProps) => {
    // Dialog mode: if isOpen is provided and false, don't render
    if (isOpen !== undefined && !isOpen) return null;

    // Max width mappings
    const maxWidthClasses = {
        sm: "max-w-[25rem]",
        md: "max-w-[31.25rem]",
        lg: "max-w-[34.375rem]",
        xl: "max-w-[37.5rem]",
    };

    const isDialogMode = isOpen !== undefined;
    const showConfirmButtons = onConfirm && onCancel;

    // Adjust padding for dialog mode (confirmation modal style)
    const padding =
        isDialogMode && !children ? "px-8 py-8" : "px-14 pt-10 pb-8";
    // Adjust title size for dialog mode
    const titleSize = isDialogMode && !children ? "text-2xl" : "text-4xl";

    const modalClassName = `${maxWidthClasses[maxWidth]} bg-modal-bg rounded-3xl border-[3px] border-vibrant-orange shadow-lg shadow-vibrant-orange/50 ${padding} ${className}`;

    const modalContent = (
        <div className={isDialogMode ? "relative z-10" : ""}>
            <div className={modalClassName}>
                {/* Header */}
                <div
                    className={`flex flex-col text-center ${message || showConfirmButtons ? "mb-6" : "mb-6"}`}
                >
                    <h1
                        className={`text-white-pearl font-title ${titleSize} font-semibold ${subtitle || message ? "mb-3" : "mb-4"}`}
                    >
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-white-pearl/80 text-base">
                            {subtitle}
                        </p>
                    )}
                    {message && (
                        <div className="text-input-text text-base leading-relaxed">
                            {message}
                        </div>
                    )}
                </div>

                {/* Content */}
                {children && <div className="space-y-6">{children}</div>}

                {/* Confirmation Buttons */}
                {showConfirmButtons && (
                    <div className="flex gap-4 justify-center mt-6">
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
                )}
            </div>
        </div>
    );

    // Dialog mode: wrap with backdrop
    if (isDialogMode) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-deep-bg/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                {modalContent}
            </div>
        );
    }

    // Container mode: return modal directly
    return modalContent;
};

export default Modal;
