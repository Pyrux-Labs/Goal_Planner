import { GOAL_COLORS } from "./colors";

export const categories = [
    { name: "Health", icon: "./Health.svg" },
    { name: "Career", icon: "./Career.svg" },
    { name: "Academic", icon: "./Academic.svg" },
    { name: "Finance", icon: "./Finance.svg" },
    { name: "Fitness", icon: "./Fitness.svg" },
    { name: "Skill", icon: "./Skill.svg" },
    { name: "Creative", icon: "./Creative.svg" },
    { name: "Social", icon: "./Social.svg" },
];

/** @deprecated Use GOAL_COLORS from '@/lib/constants/colors' instead */
export const colors = [...GOAL_COLORS];

/** Map UI category display names to database enum values */
export const CATEGORY_MAP: Record<string, string> = {
    Health: "health",
    Career: "career",
    Academic: "academic",
    Finance: "finance",
    Fitness: "fitness",
    Skill: "skill",
    Creative: "creative",
    Social: "social",
};

/** Map database enum values to UI display names */
export const REVERSE_CATEGORY_MAP: Record<string, string> = {
    health: "Health",
    career: "Career",
    academic: "Academic",
    finance: "Finance",
    fitness: "Fitness",
    skill: "Skill",
    creative: "Creative",
    social: "Social",
};
