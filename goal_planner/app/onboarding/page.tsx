"use client";

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
    Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { BiSolidError } from "react-icons/bi";
import { TfiArrowRight } from "react-icons/tfi";

import ProgressBar from "@/components/Onboarding/ProgressBar/ProgressBar";
import StepHeader from "@/components/Onboarding/StepHeader/StepHeader";
import NavigationButtons from "@/components/Onboarding/NavigationButtons/NavigationButtons";
import GoalForm, { GoalFormRef } from "@/components/common/GoalForm/GoalForm";
import GoalCard from "@/components/common/GoalCard/GoalCard";
import Button from "@/components/ui/Button/Button";
import Modal from "@/components/ui/Modal/Modal";

import { createClient } from "@/lib/supabase/client";
import { useGoalsData } from "@/hooks/useGoalsData";
import { useGoalDeletion } from "@/hooks/useGoalDeletion";
import { formatGoalForDisplay } from "@/utils/goalDataUtils";

import CalendarImg from "../../public/CalendarScreenshot.png";

export const dynamic = "force-dynamic";

// ===== STEP LABELS =====
const STEP_LABELS = [
    "GOAL SELECTION",
    "GOAL CONFIGURATION",
    "FINAL COMMITMENT",
];

// ===== COMPONENT =====
function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentStep = parseInt(searchParams.get("step") || "1", 10);
    const goalFormRef = useRef<GoalFormRef>(null);

    // State
    const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
    const [onboardingError, setOnboardingError] = useState("");
    const errorRef = useRef<HTMLDivElement>(null);

    // Shared hooks
    const { goals, loading: isLoadingGoals, refetch } = useGoalsData();
    const {
        isDeleteModalOpen,
        goalToDelete,
        isDeleting,
        handleDeleteClick,
        handleConfirmDelete,
        handleCancelDelete,
        handleTaskDelete,
        handleHabitDelete,
    } = useGoalDeletion(refetch);

    const formattedGoals = useMemo(
        () => goals.map(formatGoalForDisplay),
        [goals],
    );

    // Scroll to error when it appears
    useEffect(() => {
        if (onboardingError && errorRef.current) {
            errorRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [onboardingError]);

    // Refresh goals when entering step 3
    useEffect(() => {
        if (currentStep === 3) {
            refetch();
            setCurrentGoalId(null);
        }
    }, [currentStep, refetch]);

    // ===== NAVIGATION =====
    const handleNext = async () => {
        setOnboardingError("");

        if (currentStep === 2) {
            if (!currentGoalId) {
                const goalId = await goalFormRef.current?.saveGoal();
                if (!goalId) return;
                setCurrentGoalId(goalId);
                return; // Stay on step 2 to add tasks/habits
            }

            // Validate at least one task or habit exists
            try {
                const supabase = createClient();
                const [{ data: tasks }, { data: habits }] = await Promise.all([
                    supabase
                        .from("tasks")
                        .select("id")
                        .eq("goal_id", currentGoalId)
                        .is("deleted_at", null)
                        .limit(1),
                    supabase
                        .from("habits")
                        .select("id")
                        .eq("goal_id", currentGoalId)
                        .is("deleted_at", null)
                        .limit(1),
                ]);

                if (
                    (!tasks || tasks.length === 0) &&
                    (!habits || habits.length === 0)
                ) {
                    setOnboardingError(
                        "Please add at least one task or habit to your goal before continuing.",
                    );
                    return;
                }
            } catch {
                setOnboardingError(
                    "Failed to validate goal. Please try again.",
                );
                return;
            }
        }

        router.push(`/onboarding?step=${currentStep + 1}`);
    };

    const handlePrevious = () => {
        if (currentStep === 2) setCurrentGoalId(null);
        router.push(`/onboarding?step=${currentStep - 1}`);
    };

    // ===== RENDER =====
    return (
        <>
            <div className="min-h-screen bg-deep-bg flex flex-col">
                <ProgressBar
                    currentStep={currentStep}
                    totalSteps={3}
                    stepLabel={STEP_LABELS[currentStep - 1]}
                />

                {/* Step 1: Welcome */}
                {currentStep === 1 && (
                    <>
                        <main className="flex-1 flex items-center pb-28 mx-4 md:mx-12 lg:mx-28">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
                                <StepHeader
                                    title={
                                        <>
                                            Transform Your{" "}
                                            <span
                                                className="text-transparent bg-clip-text"
                                                style={{
                                                    backgroundImage:
                                                        "var(--main-gradient)",
                                                }}
                                            >
                                                Ambitions{" "}
                                            </span>
                                            into Reality
                                        </>
                                    }
                                    description="GoalPlanner helps you organize your life, track your habits, and achieve your biggest dreams through a simple, visual, and rewarding experience."
                                />
                                <div className="w-full md:w-5/12 flex-shrink-0 order-last md:order-none">
                                    <Image
                                        src={CalendarImg}
                                        alt="GoalPlanner Dashboard Preview"
                                        className="w-full h-full object-contain rounded-3xl border-2 border-input-bg"
                                    />
                                </div>
                            </div>
                        </main>
                        <footer className="fixed bottom-0 left-0 right-0 py-6 flex justify-center px-6 md:px-0">
                            <Button
                                onClick={handleNext}
                                className="flex items-center justify-center w-full md:w-96 h-16 gap-5 font-semibold"
                            >
                                Start Your Journey
                                <TfiArrowRight />
                            </Button>
                        </footer>
                    </>
                )}

                {/* Step 2: Define Goal */}
                {currentStep === 2 && (
                    <>
                        <main className="pt-4 pb-28 overflow-y-auto mx-4 md:mx-12 lg:mx-28">
                            <StepHeader
                                title={
                                    currentGoalId
                                        ? "Add Tasks & Habits"
                                        : "Define Your First Goal"
                                }
                                description={
                                    currentGoalId
                                        ? "Organize your goal with tasks and daily habits. You can add more later!"
                                        : "Break down your ambition into actionable daily or weekly tasks."
                                }
                            />
                            <GoalForm ref={goalFormRef} />

                            {onboardingError && (
                                <div
                                    ref={errorRef}
                                    className="flex items-center gap-2 text-carmin text-base mt-4 mb-6 bg-carmin/10 border border-carmin rounded-2xl p-4"
                                >
                                    <BiSolidError className="text-xl flex-shrink-0" />
                                    <span>{onboardingError}</span>
                                </div>
                            )}
                        </main>
                        <NavigationButtons
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            nextLabel={
                                currentGoalId ? "Finish Setup" : "Save Goal"
                            }
                        />
                    </>
                )}

                {/* Step 3: Summary */}
                {currentStep === 3 && (
                    <>
                        <main className="pt-4 pb-28 overflow-y-auto mx-4 md:mx-12 lg:mx-28">
                            <StepHeader
                                title="You're All Set"
                                description="Here is a summary of your created goals. You can add more now or jump straight into your dashboard."
                            />

                            {isLoadingGoals ? (
                                <div className="text-center py-12 text-white-pearl">
                                    <p className="text-lg">
                                        Loading your goals...
                                    </p>
                                </div>
                            ) : formattedGoals.length === 0 ? (
                                <div className="text-center py-12 text-input-text">
                                    <p className="text-lg">
                                        No goals created yet.
                                    </p>
                                </div>
                            ) : (
                                formattedGoals.map((goal) => (
                                    <GoalCard
                                        key={goal.id}
                                        goalId={goal.id}
                                        title={goal.name}
                                        description={
                                            goal.description ||
                                            goal.categoryName
                                        }
                                        progress={goal.progress}
                                        targetDate={goal.formattedDate}
                                        category={goal.categoryName}
                                        tasks={goal.formattedTasks}
                                        habits={goal.formattedHabits}
                                        onTaskAdd={() => refetch()}
                                        onHabitAdd={() => refetch()}
                                        onTaskDelete={(taskIndex) => {
                                            const task = goal.tasks[taskIndex];
                                            if (task)
                                                handleTaskDelete(
                                                    task.id,
                                                    task.name,
                                                );
                                        }}
                                        onHabitDelete={(habitIndex) => {
                                            const habit =
                                                goal.habits[habitIndex];
                                            if (habit)
                                                handleHabitDelete(
                                                    habit.id,
                                                    habit.name,
                                                );
                                        }}
                                        onEdit={() =>
                                            router.push(
                                                `/edit-goal?id=${goal.id}`,
                                            )
                                        }
                                        onDelete={() =>
                                            handleDeleteClick(
                                                goal.id,
                                                goal.name,
                                            )
                                        }
                                    />
                                ))
                            )}
                        </main>
                        <NavigationButtons
                            onPrevious={handlePrevious}
                            nextLabel="Start My Journey"
                            nextHref="/calendar"
                        />
                    </>
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                title="Delete Goal?"
                message={
                    <>
                        Are you sure you want to delete{" "}
                        <strong className="text-white-pearl">
                            {goalToDelete?.name}
                        </strong>
                        ? This will permanently delete the goal and all
                        associated tasks, habits, and their logs. This action
                        cannot be undone.
                    </>
                }
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                onClose={handleCancelDelete}
                isLoading={isDeleting}
                maxWidth="md"
            />
        </>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-deep-bg" />}>
            <OnboardingContent />
        </Suspense>
    );
}
