"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import Toast, { type ToastType } from "./Toast";

interface ToastData {
    id: number;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    showConfirm: (
        message: string,
        onConfirm: () => void | Promise<void>,
        options?: { confirmText?: string; cancelText?: string; title?: string },
    ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [confirmModal, setConfirmModal] = useState<{
        message: string;
        onConfirm: () => void | Promise<void>;
        confirmText: string;
        cancelText: string;
        title: string;
        isLoading: boolean;
    } | null>(null);

    const showToast = useCallback(
        (message: string, type: ToastType = "success", duration = 4000) => {
            const id = ++toastIdCounter;
            setToasts((prev) => [...prev, { id, message, type, duration }]);
        },
        [],
    );

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showConfirm = useCallback(
        (
            message: string,
            onConfirm: () => void | Promise<void>,
            options?: {
                confirmText?: string;
                cancelText?: string;
                title?: string;
            },
        ) => {
            setConfirmModal({
                message,
                onConfirm,
                confirmText: options?.confirmText ?? "Confirm",
                cancelText: options?.cancelText ?? "Cancel",
                title: options?.title ?? "Confirm Action",
                isLoading: false,
            });
        },
        [],
    );

    const handleConfirm = useCallback(async () => {
        if (!confirmModal) return;
        setConfirmModal((prev) => (prev ? { ...prev, isLoading: true } : null));
        try {
            await confirmModal.onConfirm();
        } finally {
            setConfirmModal(null);
        }
    }, [confirmModal]);

    const handleCancelConfirm = useCallback(() => {
        setConfirmModal(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}

            {/* Toast stack */}
            <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>

            {/* Confirm modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-deep-bg/80 backdrop-blur-sm"
                        onClick={handleCancelConfirm}
                    />
                    <div className="relative z-10 max-w-[25rem] w-[90%] bg-modal-bg rounded-3xl border-[3px] border-vibrant-orange shadow-lg shadow-vibrant-orange/50 px-6 md:px-8 py-6 md:py-8">
                        <h2 className="text-white-pearl font-title text-2xl font-semibold mb-3 text-center">
                            {confirmModal.title}
                        </h2>
                        <p className="text-input-text text-base leading-relaxed text-center mb-6">
                            {confirmModal.message}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleCancelConfirm}
                                disabled={confirmModal.isLoading}
                                className="px-4 py-2 text-sm md:text-base font-text rounded bg-input-bg text-white-pearl transition hover:bg-input-bg/80 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={confirmModal.isLoading}
                                className="px-4 py-2 text-sm md:text-base font-text rounded bg-vibrant-orange text-white-pearl transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {confirmModal.isLoading
                                    ? "Processing..."
                                    : confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return ctx;
}
