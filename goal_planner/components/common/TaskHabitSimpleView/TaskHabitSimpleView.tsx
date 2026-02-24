import DropdownMenu from "../DropdownMenu/DropdownMenu";

interface TaskHabitSimpleViewProps {
    title: string;
    days?: string;
    time?: string;
    type: "task" | "habit";
    completed?: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

export default function TaskHabitSimpleView({
    title,
    days,
    time,
    type,
    completed = false,
    onEdit,
    onDelete,
}: TaskHabitSimpleViewProps) {
    const typeLabel = type === "task" ? "Task" : "Habit";

    return (
        <div
            className={`w-full max-w-[33rem] rounded-3xl border border-input-bg bg-modal-bg flex items-center my-2 h-16 md:h-20 p-4 md:p-6 transition-opacity duration-300 ${
                completed ? "opacity-50" : ""
            }`}
        >
            {/* Content Section */}
            <div className="flex items-center gap-4 flex-1">
                {/* Dot Indicator */}
                <div
                    className={`w-2 h-2 rounded-full ${
                        completed ? "bg-green-500" : "bg-vibrant-orange"
                    }`}
                />

                {/* Text Content */}
                <div>
                    <h3
                        className={`font-medium text-lg ${
                            completed
                                ? "line-through text-input-text"
                                : "text-white-pearl"
                        }`}
                    >
                        {title}
                    </h3>
                    {(time || days) && (
                        <p
                            className={`uppercase text-xs ${
                                completed
                                    ? "text-input-text line-through"
                                    : "text-white-pearl"
                            }`}
                        >
                            {time && (
                                <>
                                    {time}
                                    {days && <span className="mx-3">|</span>}
                                </>
                            )}
                            {days}
                        </p>
                    )}
                </div>
            </div>

            {/* Menu Button */}
            <DropdownMenu
                items={[
                    {
                        label: `Edit ${typeLabel}`,
                        onClick: onEdit,
                    },
                    {
                        label: `Delete ${typeLabel}`,
                        onClick: onDelete,
                        variant: "danger" as const,
                    },
                ]}
            />
        </div>
    );
}
