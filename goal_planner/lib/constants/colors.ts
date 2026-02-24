/**
 * Color mapping constants for goal color tags.
 * Maps hex colors (used in UI) to database color names and vice versa.
 */

/** Map hex colors to database color names */
export const COLOR_MAP: Record<string, string> = {
	"#D94E06": "orange",
	"#1F6AE1": "blue",
	"#2EBB57": "green",
	"#8B5CF6": "purple",
	"#F0E23A": "yellow",
};

/** Map database color names to hex colors */
export const REVERSE_COLOR_MAP: Record<string, string> = {
	orange: "#D94E06",
	blue: "#1F6AE1",
	green: "#2EBB57",
	purple: "#8B5CF6",
	yellow: "#F0E23A",
};
