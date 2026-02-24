"use client";

import { useEffect, useState, useRef } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({
    message,
    type = "success",
    duration = 4000,
    onClose,
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true));

        timerRef.current = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration]);

    const handleClose = () => {
        if (isExiting) return;
        setIsExiting(true);
        if (timerRef.current) clearTimeout(timerRef.current);

        setTimeout(() => {
            onClose();
        }, 300);
    };

    const isSuccess = type === "success";
    const Icon = isSuccess ? CheckCircle : AlertCircle;
    const bgColor = isSuccess ? "bg-sea-green" : "bg-carmin";

    return (
        <div
            className={`pointer-events-auto min-w-[280px] max-w-[400px] ${bgColor} rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                isVisible && !isExiting
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
            }`}
        >
            <div className="flex items-center gap-3 px-4 py-3">
                <Icon className="w-5 h-5 flex-shrink-0 text-white" />
                <p className="text-white text-sm flex-1">{message}</p>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="w-3.5 h-3.5 text-white" />
                </button>
            </div>
        </div>
    );
}
