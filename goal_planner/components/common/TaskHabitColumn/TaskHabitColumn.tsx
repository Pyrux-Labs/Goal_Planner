import { useState } from "react";
import { IoMdTime } from "react-icons/io";
import { BsStars } from "react-icons/bs";
import TaskHabitSimpleView from "../TaskHabitSimpleView/TaskHabitSimpleView";
import { FaPlus } from "react-icons/fa";
import AddTask from "../AddTask/AddTask";
import AddHabit from "../AddHabit/AddHabit";

interface Item {
    title: string;
    days?: string;
    time?: string;
}

interface TaskHabitColumnProps {
    type: "task" | "habit";
    items?: Item[];
    goalId: number;
    onAdd?: () => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
}

export default function TaskHabitColumn({
    type,
    items = [],
    goalId,
    onAdd,
    onEdit,
    onDelete,
}: TaskHabitColumnProps) {
    const isTask = type === "task";
    const [isExpanded, setIsExpanded] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const handleAddClick = () => {
        setIsExpanded(true);
        // Delay para que la transición se vea
        setTimeout(() => setShowForm(true), 10);
    };

    const handleClose = () => {
        setShowForm(false);
        setTimeout(() => {
            setIsExpanded(false);
            if (onAdd) onAdd();
        }, 300);
    };

    const handleCancel = () => {
        setShowForm(false);
        setTimeout(() => setIsExpanded(false), 300);
    };

    return (
        <div className="flex flex-col items-center">
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

            {items.map((item, index) => (
                <TaskHabitSimpleView
                    key={index}
                    title={item.title}
                    days={item.days}
                    time={item.time}
                    type={type}
                    onEdit={() => onEdit(index)}
                    onDelete={() => onDelete(index)}
                />
            ))}

            {/* Add Button or Expandable Form */}
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
                        />
                    ) : (
                        <AddHabit
                            goalId={goalId}
                            onClose={handleClose}
                            onCancel={handleCancel}
                            inline
                        />
                    )}
                </div>
            )}
        </div>
    );
}
