import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useMemo, memo } from "react";
import TaskHabitColumn from "../TaskHabitColumn/TaskHabitColumn";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import { categories } from "@/lib/constants/categories";
import { COMPLETED_GOAL_COLOR } from "@/lib/constants/colors";
import type { TaskHabitItem } from "../TaskHabitColumn/TaskHabitColumn";

interface GoalCardProps {
    title: string;
    description?: string;
    progress: number;
    targetDate: string;
    category: string;
    goalId: number;
    tasks?: TaskHabitItem[];
    habits?: TaskHabitItem[];
    onEdit: () => void;
    onDelete: () => void;
    onTaskAdd: () => void;
    onHabitAdd: () => void;
    onTaskDelete: (index: number) => void;
    onHabitDelete: (index: number) => void;
}

export default memo(function GoalCard({
    title,
    description,
    progress = 0,
    targetDate,
    category,
    goalId,
    tasks = [],
    habits = [],
    onEdit,
    onDelete,
    onTaskAdd,
    onHabitAdd,
    onTaskDelete,
    onHabitDelete,
}: GoalCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isCompleted = progress >= 100;

    const categoryIcon = useMemo(
        () => categories.find((cat) => cat.name === category)?.icon,
        [category],
    );

    return (
        <div className="max-w-[70rem] w-full rounded-3xl border border-input-bg bg-modal-bg mx-auto">
            {/* Header Row */}
            <div
                className="min-h-[4.5rem] md:h-24 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 p-4 md:p-6 cursor-pointer relative"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 md:gap-6 w-full md:w-auto">
                    {/* Icon Badge */}
                    <div
                        className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex justify-center flex-shrink-0"
                        style={{
                            backgroundColor: isCompleted
                                ? COMPLETED_GOAL_COLOR
                                : "#d94e06",
                        }}
                    >
                        {categoryIcon && (
                            <Image
                                src={categoryIcon}
                                alt={category}
                                width={30}
                                height={30}
                                className="filter brightness-0 invert w-5 h-5 md:w-[30px] md:h-[30px] self-center"
                            />
                        )}
                    </div>

                    {/* Title and Description */}
                    <div className="flex-1 min-w-0 md:max-w-md">
                        <h3 className="text-white-pearl font-semibold text-base md:text-lg mb-0.5 md:mb-1 truncate">
                            {title}
                        </h3>
                        <p className="font-medium text-input-text text-xs md:text-sm truncate">
                            {description}
                        </p>
                    </div>

                    {/* Dropdown — mobile: top-right */}
                    <div className="md:hidden flex-shrink-0">
                        <DropdownMenu
                            items={[
                                { label: "Edit Goal", onClick: onEdit },
                                { label: "Delete Goal", onClick: onDelete },
                            ]}
                        />
                    </div>
                </div>

                {/* Progress + Target + Dropdown (desktop) */}
                <div className="flex items-center gap-4 md:gap-0 w-full md:flex-1 md:justify-end">
                    {/* Progress */}
                    <div className="flex-1 md:w-64 md:flex-none md:mr-8">
                        <div className="flex justify-between text-white-pearl text-xs md:text-sm mb-1 font-medium">
                            <p>{isCompleted ? "COMPLETED" : "Progress"}</p>
                            <p>{progress}%</p>
                        </div>
                        <div className="h-1.5 md:h-2 bg-progress-empty rounded-full">
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${progress}%`,
                                    backgroundColor: isCompleted
                                        ? COMPLETED_GOAL_COLOR
                                        : "#d94e06",
                                }}
                            />
                        </div>
                    </div>

                    {/* Target Date */}
                    <div className="flex flex-col items-end md:mr-8 flex-shrink-0">
                        <span className="text-input-text text-[10px] md:text-xs">
                            TARGET
                        </span>
                        <span className="text-white-pearl font-semibold text-xs md:text-sm">
                            {targetDate}
                        </span>
                    </div>

                    {/* Dropdown — desktop */}
                    <div className="hidden md:block">
                        <DropdownMenu
                            items={[
                                { label: "Edit Goal", onClick: onEdit },
                                { label: "Delete Goal", onClick: onDelete },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Expanded Content — Tasks and Habits */}
            <div
                className={cn(
                    "transition-all duration-500",
                    isExpanded
                        ? "min-h-40 max-h-[32rem] opacity-100 overflow-y-auto scrollbar-custom mb-5"
                        : "max-h-0 opacity-0 overflow-hidden",
                )}
            >
                <div className="border-t border-input-bg p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                        <TaskHabitColumn
                            type="task"
                            items={tasks}
                            goalId={goalId}
                            onAdd={onTaskAdd}
                            onDelete={onTaskDelete}
                        />
                        <TaskHabitColumn
                            type="habit"
                            items={habits}
                            goalId={goalId}
                            onAdd={onHabitAdd}
                            onDelete={onHabitDelete}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
