import Image from "next/image";
import TaskHabitColumn from "../TaskHabitColumn/TaskHabitColumn";
import clsx from "clsx";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import { useState } from "react";
import { categories } from "@/lib/constants/categories";
import AddTask from "../AddTask/AddTask";
import AddHabit from "../AddHabit/AddHabit";

interface Task {
    title: string;
    days?: string;
    time?: string;
}

interface Habit {
    title: string;
    days?: string;
    time?: string;
}

interface GoalCardProps {
    title: string;
    description?: string;
    progress: number;
    targetDate: string;
    category: string;
    goalId: number;
    tasks?: Task[];
    habits?: Habit[];
    onEdit: () => void;
    onDelete: () => void;
    onTaskAdd: () => void;
    onHabitAdd: () => void;
    onTaskEdit: (index: number) => void;
    onTaskDelete: (index: number) => void;
    onHabitEdit: (index: number) => void;
    onHabitDelete: (index: number) => void;
}

export default function GoalCard({
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
    onTaskEdit,
    onTaskDelete,
    onHabitEdit,
    onHabitDelete,
}: GoalCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showHabitModal, setShowHabitModal] = useState(false);

    const handleTaskAdd = () => {
        setShowTaskModal(true);
    };

    const handleHabitAdd = () => {
        setShowHabitModal(true);
    };

    const handleTaskModalClose = () => {
        setShowTaskModal(false);
        onTaskAdd();
    };

    const handleHabitModalClose = () => {
        setShowHabitModal(false);
        onHabitAdd();
    };

    return (
        <>
            <div className="max-w-[70rem] w-full rounded-3xl border border-input-bg bg-modal-bg my-2 mx-auto">
                <div
                    className="h-24 flex flex-row items-center gap-6 p-6 cursor-pointer relative"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {/* Icon Badge */}
                    <div className="w-14 h-14 bg-vibrant-orange rounded-2xl flex justify-center">
                        <Image
                            src={
                                categories.find((cat) => cat.name === category)!
                                    .icon
                            }
                            alt={category}
                            width={30}
                            height={30}
                            className="filter brightness-0 invert"
                        />
                    </div>
                    {/* Title and Description */}
                    <div className="flex-1 max-w-md">
                        <h3 className="text-white-pearl font-semibold text-lg mb-1 truncate">
                            {title}
                        </h3>
                        <p className="font-medium text-input-text text-sm truncate">
                            {description}
                        </p>
                    </div>

                    {/* Progress Section */}
                    <div className="w-64 mr-8">
                        <div className="flex justify-between text-white-pearl text-sm mb-1 font-medium">
                            <p>Progress</p>
                            <p>{progress}%</p>
                        </div>
                        <div className="h-2 bg-progress-empty rounded-full">
                            <div
                                className="h-full bg-vibrant-orange rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Target Date Section */}
                    <div className="flex flex-col items-end mr-8">
                        <span className="text-input-text text-xs">TARGET</span>
                        <span className="text-white-pearl font-semibold text-sm">
                            {targetDate}
                        </span>
                    </div>

                    {/* Dropdown */}
                    <DropdownMenu
                        items={[
                            {
                                label: "Edit Goal",
                                onClick: onEdit,
                            },
                            {
                                label: "Delete Goal",
                                onClick: onDelete,
                            },
                        ]}
                    />
                </div>

                {/* Expanded Content - Tasks and Habits */}
                <div
                    className={clsx(
                        "transition-all duration-500",
                        isExpanded
                            ? "min-h-40 max-h-96 opacity-100 overflow-y-auto scrollbar-custom mb-5"
                            : "max-h-0 opacity-0 overflow-hidden",
                    )}
                >
                    <div className="border-t border-input-bg p-6">
                        <div className="grid grid-cols-2 gap-12">
                            <TaskHabitColumn
                                type="task"
                                items={tasks}
                                onAdd={handleTaskAdd}
                                onEdit={onTaskEdit}
                                onDelete={onTaskDelete}
                            />
                            <TaskHabitColumn
                                type="habit"
                                items={habits}
                                onAdd={handleHabitAdd}
                                onEdit={onHabitEdit}
                                onDelete={onHabitDelete}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showTaskModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowTaskModal(false)}
                >
                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AddTask
                            goalId={goalId}
                            onClose={handleTaskModalClose}
                            onCancel={() => setShowTaskModal(false)}
                        />
                    </div>
                </div>
            )}

            {showHabitModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowHabitModal(false)}
                >
                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AddHabit
                            goalId={goalId}
                            onClose={handleHabitModalClose}
                            onCancel={() => setShowHabitModal(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
