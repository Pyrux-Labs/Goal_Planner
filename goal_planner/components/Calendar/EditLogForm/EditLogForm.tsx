"use client";

import { useState } from "react";
import InputField from "@/components/ui/InputField/InputField";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import { createClient } from "@/lib/supabase/client";

interface EditTaskLogProps {
    logId: number;
    date: string;
    startTime: string | null;
    endTime: string | null;
    taskName: string;
    onClose: () => void;
}

interface EditHabitLogProps {
    logId: number;
    date: string;
    habitName: string;
    onClose: () => void;
}

export function EditTaskLog({
    logId,
    date,
    startTime,
    endTime,
    taskName,
    onClose,
}: EditTaskLogProps) {
    const [editDate, setEditDate] = useState(date);
    const [editStartTime, setEditStartTime] = useState(startTime || "");
    const [editEndTime, setEditEndTime] = useState(endTime || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!editDate) {
            setError("Date is required");
            return;
        }
        setIsSubmitting(true);
        setError("");

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase
                .from("task_logs")
                .update({
                    date: editDate,
                    start_time: editStartTime || null,
                    end_time: editEndTime || null,
                })
                .eq("id", logId);

            if (updateError) throw updateError;
            onClose();
        } catch {
            setError("Failed to update task log. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 px-4">
            <p className="text-white-pearl/70 text-sm">
                Editing log for:{" "}
                <span className="text-white-pearl font-medium">{taskName}</span>
            </p>

            <InputField
                label="Date"
                type="date"
                value={editDate}
                onChange={(e) => {
                    setEditDate(e.target.value);
                    if (error) setError("");
                }}
                labelClassName="block text-white-pearl mb-2 text-sm"
            />

            <div>
                <label className="block text-white-pearl mb-2 text-sm">
                    Start Time{" "}
                    <span className="text-input-text text-xs">(Optional)</span>
                </label>
                <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors"
                />
            </div>

            <div>
                <label className="block text-white-pearl mb-2 text-sm">
                    End Time{" "}
                    <span className="text-input-text text-xs">(Optional)</span>
                </label>
                <input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full h-12 bg-input-bg border border-input-bg text-white-pearl rounded-2xl px-3 focus:outline-none focus:border-vibrant-orange transition-colors"
                />
            </div>

            {error && <ErrorMessage message={error} variant="general" />}

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Updating..." : "Update Log"}
            </button>
        </div>
    );
}

export function EditHabitLog({
    logId,
    date,
    habitName,
    onClose,
}: EditHabitLogProps) {
    const [editDate, setEditDate] = useState(date);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!editDate) {
            setError("Date is required");
            return;
        }
        setIsSubmitting(true);
        setError("");

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase
                .from("habit_logs")
                .update({ date: editDate })
                .eq("id", logId);

            if (updateError) throw updateError;
            onClose();
        } catch {
            setError("Failed to update habit log. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 px-4">
            <p className="text-white-pearl/70 text-sm">
                Editing log for:{" "}
                <span className="text-white-pearl font-medium">
                    {habitName}
                </span>
            </p>

            <InputField
                label="Date"
                type="date"
                value={editDate}
                onChange={(e) => {
                    setEditDate(e.target.value);
                    if (error) setError("");
                }}
                labelClassName="block text-white-pearl mb-2 text-sm"
            />

            {error && <ErrorMessage message={error} variant="general" />}

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl bg-vibrant-orange text-white-pearl font-medium hover:bg-vibrant-orange/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? "Updating..." : "Update Log"}
            </button>
        </div>
    );
}
