import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent } from "@/types/calendar";

export function useToggleEvent(onRefresh?: () => void) {
	const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

	const toggleEvent = useCallback(
		async (event: CalendarEvent) => {
			if (updatingIds.has(event.id)) return;
			setUpdatingIds((prev) => new Set(prev).add(event.id));

			const supabase = createClient();
			const table = event.type === "task" ? "task_logs" : "habit_logs";

			const { error } = await supabase
				.from(table)
				.update({
					completed: !event.completed,
					completed_at: !event.completed
						? new Date().toISOString()
						: null,
				})
				.eq("id", event.id);

			if (error) {
				console.error("Error updating:", error);
			} else {
				onRefresh?.();
			}

			setUpdatingIds((prev) => {
				const next = new Set(prev);
				next.delete(event.id);
				return next;
			});
		},
		[updatingIds, onRefresh],
	);

	return { toggleEvent, updatingIds };
}
