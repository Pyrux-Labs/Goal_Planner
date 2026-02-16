"use client";
import { ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import CalendarUI from "@/components/Calendar/CalendarUI/CalendarUI";
import Navbar from "@/components/Layout/Navbar/Navbar";
import SidebarModal from "@/components/ui/SidebarModal/SidebarModal";
import Button from "@/components/ui/Button/Button";

interface CalendarEvent {
	id: string;
	title: string;
	color?: string;
}

export default function CalendarPage() {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const events = useMemo(() => {
		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth();
		/* 		return {}; */
		return {
			[`${year}-${String(month + 1).padStart(2, "0")}-05`]: [
				{
					id: "1",
					title: "Team Meeting",
					time: "7:00",
					color: "#F0E23A",
					completed: true,
				},
				{
					id: "2",
					title: "Project Review",
					time: "16:00",
					color: "#1F6AE1",
					completed: false,
				},
			],
			[`${year}-${String(month + 1).padStart(2, "0")}-12`]: [
				{
					id: "3",
					title: "Client Call",
					time: "10:00",
					color: "#10B981",
					completed: true,
				},
				{
					id: "5",
					title: "Client Call",
					time: "10:00",
					color: "#10B981",
					completed: true,
				},
				{
					id: "4",
					title: "Design Sprint",
					time: "14:00",
					color: "#F59E0B",
					completed: false,
				},
				{
					id: "5",
					title: "Code Review",
					time: "16:30",
					color: "#8B5CF6",
					completed: true,
				},
			],
			[`${year}-${String(month + 1).padStart(2, "0")}-15`]: [
				{
					id: "6",
					title: "Product Launch",
					time: "9:00",
					color: "#EF4444",
					completed: false,
				},
				{
					id: "7",
					title: "Marketing Meeting",
					time: "15:00",
					color: "#EC4899",
					completed: true,
				},
			],
			[`${year}-${String(month + 1).padStart(2, "0")}-20`]: [
				{
					id: "8",
					title: "Sprint Planning",
					time: "11:00",
					color: "#06B6D4",
					completed: true,
				},
				{
					id: "9",
					title: "Team Building",
					time: "17:00",
					color: "#84CC16",
					completed: false,
				},
			],
			[`${year}-${String(month + 1).padStart(2, "0")}-25`]: [
				{
					id: "10",
					title: "Quarterly Review",
					time: "13:00",
					color: "#F97316",
					completed: false,
				},
				{
					id: "11",
					title: "Strategy Session",
					time: "15:30",
					color: "#A855F7",
					completed: true,
				},
			],
			[`${year}-${String(month + 1).padStart(2, "0")}-28`]: [
				{ id: "12", title: "Documentation", color: "#1F6AE1" },
				{ id: "13", title: "Bug Triage", color: "#ef4444" },
			],
		};
	}, []);

	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);
	};

	const handleAddHabit = () => {
		console.log("Add Habit clicked");
	};

	const handleAddTask = () => {
		console.log("Add Task clicked");
	};

	const toggleModal = () => {
		setIsModalOpen((prev) => !prev);
	};
	return (
		<div className="min-h-screen bg-deep-bg flex">
			<Navbar />
			<CalendarUI
				events={events}
				onDateSelect={handleDateSelect}
				selectedDate={selectedDate}
				onAddHabit={handleAddHabit}
				onAddTask={handleAddTask}
				isModalOpen={isModalOpen}
			/>
			{isModalOpen && (
				<SidebarModal
					title="Daily Analytics"
					onClose={toggleModal}
					children={<div>Modal Content</div>}></SidebarModal>
			)}
			{!isModalOpen && (
				<Button
					onClick={toggleModal}
					className="h-36 w-10  flex justify-center items-center fixed [writing-mode:vertical-lr] rotate-180 right-0 top-1/2 -translate-y-1/2 text-base gap-12 rounded-r-[13px] rounded-l-none">
					STATS
					<ChevronRight className="w-6 h-6" />
				</Button>
			)}
		</div>
	);
}
