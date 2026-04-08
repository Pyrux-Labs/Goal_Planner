"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Top from "@/components/layout/top";
import GoalForm, { GoalFormRef } from "@/components/common/goal-form";
import NavigationButtons from "@/components/onboarding/navigation-buttons";
import { deleteGoalWithRelatedData } from "@/lib/services/goal-service";
import { ROUTES } from "@/lib/constants/routes";

export default function NewGoalPage() {
	const router = useRouter();
	const goalFormRef = useRef<GoalFormRef>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [goalId, setGoalId] = useState<number | null>(null);

	const handleNext = async () => {
		if (goalId) {
			// If goal already created, navigate to my goals
			router.push(ROUTES.GOALS);
			return;
		}

		setIsSaving(true);
		const newGoalId = await goalFormRef.current?.saveGoal();
		setIsSaving(false);

		if (newGoalId) {
			setGoalId(newGoalId);
			// Scroll to tasks and habits section after creating the goal
			setTimeout(() => {
				goalFormRef.current?.scrollToTasksHabits();
			}, 100);
		}
	};

	const handleCancel = async () => {
		if (goalId) {
			await deleteGoalWithRelatedData(goalId);
		}
		router.push(ROUTES.GOALS);
	};

	return (
		<div className="-m-4 md:-m-6 -mb-20 md:-mb-6 pb-44 md:pb-28 p-4 md:p-6">
			<Top
				title={goalId ? "Add Tasks & Habits" : "Create New Goal"}
				buttons={[
					{
						text: "Cancel",
						onClick: handleCancel,
						variant: "secondary",
					},
				]}
			/>
			<div className="mt-6">
				<GoalForm ref={goalFormRef} />
			</div>

			<NavigationButtons
				onNext={handleNext}
				nextLabel={isSaving ? "Saving..." : goalId ? "Create Goal" : "Continue"}
				showPrevious={false}
				containerClassName="pr-8 pl-4"
				hasNavbar={true}
			/>
		</div>
	);
}
