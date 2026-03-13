import { useState, useMemo } from "react";
import { IoMdTime } from "react-icons/io";
import { BsStars } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import TaskHabitSimpleView from "../TaskHabitSimpleView/TaskHabitSimpleView";
import AddTask from "../AddTask/AddTask";
import AddHabit from "../AddHabit/AddHabit";
import type { TaskEditData, HabitEditData } from "@/types/sidebar";
import type { TaskHabitItem } from "@/types/task";

interface TaskHabitColumnProps {
	type: "task" | "habit";
	items?: TaskHabitItem[];
	goalId?: number;
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

	// Form state
	const [showAddForm, setShowAddForm] = useState(false);
	const [addFormVisible, setAddFormVisible] = useState(false);
	const [editingSortedIndex, setEditingSortedIndex] = useState<number | null>(
		null,
	);
	const [editFormVisible, setEditFormVisible] = useState(false);

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
		setEditingSortedIndex(null);
		setEditFormVisible(false);
		setShowAddForm(true);
		setTimeout(() => setAddFormVisible(true), 10);
	};

	const handleEditClick = (sortedIndex: number) => {
		const item = sortedItems[sortedIndex];
		if (!item.editData) return;

		// Close add form if open
		setShowAddForm(false);
		setAddFormVisible(false);

		setEditingSortedIndex(sortedIndex);
		setTimeout(() => setEditFormVisible(true), 10);
	};

	const handleClose = () => {
		setAddFormVisible(false);
		setEditFormVisible(false);
		setTimeout(() => {
			setShowAddForm(false);
			setEditingSortedIndex(null);
			onAdd?.();
		}, 300);
	};

	const handleCancel = () => {
		setAddFormVisible(false);
		setEditFormVisible(false);
		setTimeout(() => {
			setShowAddForm(false);
			setEditingSortedIndex(null);
		}, 300);
	};

	const renderForm = (editData?: TaskEditData | HabitEditData) =>
		isTask ? (
			<AddTask
				goalId={goalId}
				onClose={handleClose}
				onCancel={handleCancel}
				inline
				editData={editData as TaskEditData | undefined}
			/>
		) : (
			<AddHabit
				goalId={goalId}
				onClose={handleClose}
				onCancel={handleCancel}
				inline
				editData={editData as HabitEditData | undefined}
			/>
		);

	return (
		<div className="flex flex-col items-center">
			{/* Section Header */}
			<div className="flex items-center gap-2 my-4 md:my-6 w-full max-w-[33rem]">
				<div className="bg-input-bg rounded-3xl flex items-center justify-center w-8 h-8 md:w-10 md:h-10">
					{isTask ? (
						<IoMdTime
							size={18}
							className="text-vibrant-orange md:text-[22px]"
						/>
					) : (
						<BsStars size={18} className="text-vibrant-orange md:text-[22px]" />
					)}
				</div>
				<h1 className="text-white-pearl font-title text-xl md:text-2xl font-semibold">
					{isTask ? "Tasks" : "Daily Habits"}
				</h1>
			</div>

			{/* Item List — replace specific item with edit form when editing */}
			{sortedItems.map((item, sortedIndex) =>
				editingSortedIndex === sortedIndex ? (
					<div
						key={sortedIndex}
						className={`w-full max-w-[33rem] my-2 transition-all duration-500 ease-out ${
							editFormVisible
								? "opacity-100 translate-y-0"
								: "opacity-0 -translate-y-4"
						}`}>
						{renderForm(item.editData)}
					</div>
				) : (
					<TaskHabitSimpleView
						key={sortedIndex}
						title={item.title}
						days={item.days}
						time={item.time}
						type={type}
						completed={item.completed}
						onEdit={() => handleEditClick(sortedIndex)}
						onDelete={() => onDelete(sortedToOriginalIndex[sortedIndex])}
					/>
				),
			)}

			{/* Add Button / Inline Add Form */}
			{!showAddForm ? (
				<button
					onClick={handleAddClick}
					className="w-full max-w-[33rem] rounded-3xl border flex items-center my-2 h-16 md:h-20 p-4 md:p-6 border-dashed border-vibrant-orange/15 gap-2 hover:border-vibrant-orange transition-all duration-300">
					<div className="w-7 h-7 md:w-8 md:h-8 border-2 border-vibrant-orange rounded-full flex items-center justify-center">
						<FaPlus size={12} className="text-vibrant-orange md:text-[14px]" />
					</div>
					<span className="text-vibrant-orange font-medium text-sm md:text-base">
						{isTask ? "Add Task" : "Add Daily Habit"}
					</span>
				</button>
			) : (
				<div
					className={`w-full max-w-[33rem] my-2 transition-all duration-500 ease-out ${
						addFormVisible
							? "opacity-100 translate-y-0"
							: "opacity-0 -translate-y-4"
					}`}>
					{renderForm()}
				</div>
			)}
		</div>
	);
}
