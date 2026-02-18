"use client";
import { useState } from "react";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Top from "@/components/Layout/Top/Top";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import { categories } from "@/lib/constants/categories";

export default function AnualGoalsPage() {
    const [goals, setGoals] = useState([
        {
            icon: categories.find((c) => c.name === "Creative")?.icon,
            title: "Master UI Design",
            category: "Creative",
            targetDate: "Dec 31, 2026",
            tasks: [
                {
                    title: "Complete Figma course",
                    days: "Mon, Wed, Fri",
                    time: "10:00 AM",
                },
                {
                    title: "Build portfolio website",
                    days: "Tue",
                },
            ],
            habits: [
                {
                    title: "Daily design practice",
                    days: "Everyday",
                },
            ],
        },
        {
            icon: categories.find((c) => c.name === "Fitness")?.icon,
            title: "Run Half Marathon",
            category: "Fitness",
            targetDate: "Nov 15, 2026",
        },
        {
            icon: categories.find((c) => c.name === "Creative")?.icon,
            title: "Learn Spanish",
            category: "Creative",
            targetDate: "Aug 20, 2026",
        },
        {
            icon: categories.find((c) => c.name === "Health")?.icon,
            title: "Morning Meditation",
            category: "Health",
            targetDate: "Mar 31, 2026",
        },
    ]);

    const [selectedFilter, setSelectedFilter] = useState<
        "all" | "active" | "completed"
    >("all");

    const filters: Array<{
        id: "all" | "active" | "completed";
        label: string;
    }> = [
        { id: "all", label: "All" },
        { id: "active", label: "Active" },
        { id: "completed", label: "Completed" },
    ];

    const handleNewGoal = () => {
        console.log("New Goal clicked");
    };

    return (
        <div>
            <Navbar />
            <div className="mx-16 p-6">
                <Top
                    title="My Goals"
                    buttons={[
                        {
                            text: "New Goal",
                            onClick: handleNewGoal,
                        },
                    ]}
                />
                <div className="h-14 w-full bg-modal-bg border font-medium text-white-pearl border-input-bg rounded-3xl flex items-center px-6 gap-10 whitespace-nowrap">
                    <span>12 Active</span>
                    <span>|</span>
                    <span>4 Completed</span>
                    <span>|</span>
                    <span>
                        Overall Year Progress:
                        <span className="text-vibrant-orange"> 78%</span>
                    </span>
                    <div className=" w-1/2 h-2 bg-input-bg rounded-full overflow-hidden">
                        <div
                            className="h-full bg-vibrant-orange"
                            style={{ width: "78%" }}
                        ></div>
                    </div>
                </div>
                <div className="h-16 w-full font-medium text-white-pearl flex items-center px-6 gap-10 my-8 border-b-2 pb-6 border-input-bg">
                    {filters.map((filter) => (
                        <span
                            key={filter.id}
                            className={`cursor-pointer border-b-2 pb-1 transition-colors duration-200 ${
                                selectedFilter === filter.id
                                    ? "text-vibrant-orange border-vibrant-orange"
                                    : "border-modal-bg hover:text-vibrant-orange hover:border-vibrant-orange"
                            }`}
                            onClick={() => setSelectedFilter(filter.id)}
                        >
                            {filter.label}
                        </span>
                    ))}
                </div>
                <div className="space-y-4">
                    {goals.map((goal, index) => (
                        <GoalCard
                            key={index}
                            title={goal.title}
                            description={goal.category}
                            progress={50}
                            targetDate={goal.targetDate}
                            category={goal.category}
                            tasks={goal.tasks || []}
                            habits={goal.habits || []}
                            onTaskAdd={() =>
                                console.log(`Add task to ${goal.title}`)
                            }
                            onHabitAdd={() =>
                                console.log(`Add habit to ${goal.title}`)
                            }
                            onTaskEdit={(taskIndex: number) =>
                                console.log(
                                    `Edit task ${taskIndex} from ${goal.title}`,
                                )
                            }
                            onTaskDelete={(taskIndex: number) =>
                                console.log(
                                    `Delete task ${taskIndex} from ${goal.title}`,
                                )
                            }
                            onHabitEdit={(habitIndex: number) =>
                                console.log(
                                    `Edit habit ${habitIndex} from ${goal.title}`,
                                )
                            }
                            onHabitDelete={(habitIndex: number) =>
                                console.log(
                                    `Delete habit ${habitIndex} from ${goal.title}`,
                                )
                            }
                            onEdit={() => console.log(`Edit ${goal.title}`)}
                            onDelete={() => console.log(`Delete ${goal.title}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
