import { useState, useCallback, useRef } from "react";
import { toggleEventCompletion } from "@/lib/services/event-service";
import type { CalendarEvent } from "@/types/calendar";

export function useToggleEvent(onRefresh?: () => void) {
    // Use ref to track in-flight IDs without causing callback recreation
    const updatingIdsRef = useRef<Set<number>>(new Set());
    // Keep state for UI reactivity (marking items as updating)
    const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

    const toggleEvent = useCallback(
        async (event: CalendarEvent) => {
            if (updatingIdsRef.current.has(event.id)) return;
            updatingIdsRef.current.add(event.id);
            setUpdatingIds(new Set(updatingIdsRef.current));

            try {
                await toggleEventCompletion(event);
                onRefresh?.();
            } catch (error) {
                console.error("Error updating:", error);
            }

            updatingIdsRef.current.delete(event.id);
            setUpdatingIds(new Set(updatingIdsRef.current));
        },
        [onRefresh],
    );

    return { toggleEvent, updatingIds };
}
