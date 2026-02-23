import { useState, useMemo } from "react";
import { IoMdTime } from "react-icons/io";
import { BsStars } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import TaskHabitSimpleView from "../TaskHabitSimpleView/TaskHabitSimpleView";
import AddTask from "../AddTask/AddTask";
import AddHabit from "../AddHabit/AddHabit";
import type { TaskEditData, HabitEditData } from "@/types/sidebar";

export interface TaskHabitItem {
    title: string;
    days?: string;
    time?: string;
    completed?: boolean;
    editData?: TaskEditData | HabitEditData;
}

interface TaskHabitColumnProps {
    type: "task" | "habit";
    items?: TaskHabitItem[];
    goalId: number;
    onAdd?: () => void;
    onDelete: (index: number) => void;
}

export default function TaskHabitColumn({
    type,
    items = [],
    goalId,
    onAdd,
    onDelete,
}: TaskHabitColumnProps) {
    const isTask = type === "task";

    // Form state: handles both add and edit modes
    const [isExpanded, setIsExpanded] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [currentEditData, setCurrentEditData] = useState<
        TaskEditData | HabitEditData | undefined
    >(undefined);

    // Sort items: incomplete first, completed last
    const sortedItems = useMemo(() => {
        const incomplete = items.filter((item) => !item.completed);
        const completed = items.filter((item) => item.completed);
        return [...incomplete, ...completed];
    }, [items]);

    // Map sorted indices back to original indices for delete callbacks
    const sortedToOriginalIndex = useMemo(() => {
        const incomplete = items
            .map((item, i) => ({ item, originalIndex: i }))
            .filter(({ item }) => !item.completed);
        const completed = items
            .map((item, i) => ({ item, originalIndex: i }))
            .filter(({ item }) => item.completed);
        return [...incomplete, ...completed].map(
            ({ originalIndex }) => originalIndex,
        );
    }, [items]);

    const handleAddClick = () => {
        setCurrentEditData(undefined);
        setIsExpanded(true);
        setTimeout(() => setShowForm(true), 10);
    };

    const handleEditClick = (sortedIndex: number) => {
        const item = sortedItems[sortedIndex];
        if (item.editData) {
            setCurrentEditData(item.editData);
            setIsExpanded(true);
            setTimeout(() => setShowForm(true), 10);
        }
    };

    const handleClose = () => {
        setShowForm(false);
        setTimeout(() => {
            setIsExpanded(false);
            setCurrentEditData(undefined);
            onAdd?.();
        }, 300);
    };

    const handleCancel = () => {
        setShowForm(false);
        setTimeout(() => {
            setIsExpanded(false);
            setCurrentEditData(undefined);
        }, 300);
    };

    return (
        <div className="flex flex-col items-center">
            {/* Section Header */}
            <div className="flex items-center gap-2 my-6 w-[33rem]">
                <div className="bg-input-bg rounded-3xl flex items-center justify-center w-10 h-10">
                    {isTask ? (
                        <IoMdTime size={22} className="text-vibrant-orange" />
                    ) : (
                        <BsStars size={22} className="text-vibrant-orange" />
                    )}
                </div>
                <h1 className="text-white-pearl font-title text-2xl font-semibold">
                    {isTask ? "Tasks" : "Daily Habits"}
                </h1>
            </div>

            {/* Item List */}
            {sortedItems.map((item, sortedIndex) => (
                <TaskHabitSimpleView
                    key={sortedIndex}
                    title={item.title}
                    days={item.days}
                    time={item.time}
                    type={type}
                    completed={item.completed}
                    onEdit={() => handleEditClick(sortedIndex)}
                    onDelete={() =>
                        onDelete(sortedToOriginalIndex[sortedIndex])
                    }
                />
            ))}

            {/* Add Button / Inline Form (Add or Edit) */}
            {!isExpanded ? (
                <button
                    onClick={handleAddClick}
                    className="w-[33rem] rounded-3xl border flex items-center my-2 h-20 p-6 border-dashed border-vibrant-orange/15 gap-2 hover:border-vibrant-orange transition-all duration-300"
                >
                    <div className="w-8 h-8 border-2 border-vibrant-orange rounded-full flex items-center justify-center">
                        <FaPlus size={14} className="text-vibrant-orange" />
                    </div>
                    <span className="text-vibrant-orange font-medium">
                        {isTask ? "Add Task" : "Add Daily Habit"}
                    </span>
                </button>
            ) : (
                <div
                    className={`w-[33rem] my-2 transition-all duration-500 ease-out ${
                        showForm
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-4"
                    }`}
                >
                    {isTask ? (
                        <AddTask
                            goalId={goalId}
                            onClose={handleClose}
                            onCancel={handleCancel}
                            inline
                            editData={
                                currentEditData as TaskEditData | undefined
                            }
                        />
                    ) : (
                        <AddHabit
                            goalId={goalId}
                            onClose={handleClose}
                            onCancel={handleCancel}
                            inline
                            editData={
                                currentEditData as HabitEditData | undefined
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
}
