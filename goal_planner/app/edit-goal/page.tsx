"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Top from "@/components/Layout/Top/Top";
import GoalForm, { GoalFormRef } from "@/components/common/GoalForm/GoalForm";
import NavigationButtons from "@/components/Onboarding/NavigationButtons/NavigationButtons";
import { useToast } from "@/components/ui/Toast/ToastContext";

function EditGoalContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const goalFormRef = useRef<GoalFormRef>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [goalId, setGoalId] = useState<number | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        const id = searchParams.get("id");
        if (!id || isNaN(parseInt(id, 10))) {
            showToast("Invalid or missing goal ID", "error");
            router.push("/anual-goals");
            return;
        }
        setGoalId(parseInt(id, 10));
    }, [searchParams, router, showToast]);

    const handleSave = async () => {
        if (!goalId) return;

        setIsSaving(true);
        const result = await goalFormRef.current?.saveGoal();
        setIsSaving(false);

        if (result) {
            router.push("/anual-goals");
        }
    };

    const handleCancel = () => {
        router.push("/anual-goals");
    };

    return (
        <div className="min-h-screen bg-deep-bg flex flex-col">
            <Navbar />
            <div className="ml-0 md:ml-14 lg:ml-14 xl:ml-16 2xl:ml-20 mr-4 md:mr-7 p-4 md:p-6 pb-44 md:pb-28">
                <Top
                    title="Edit Goal"
                    buttons={[
                        {
                            text: "Cancel",
                            onClick: handleCancel,
                            variant: "secondary",
                        },
                    ]}
                />
                {goalId && (
                    <div className="mt-6">
                        <GoalForm ref={goalFormRef} goalId={goalId} />
                    </div>
                )}
            </div>

            <NavigationButtons
                onNext={handleSave}
                nextLabel={isSaving ? "Saving..." : "Save Changes"}
                showPrevious={false}
                containerClassName="pr-8 pl-4"
                hasNavbar={true}
            />
        </div>
    );
}

export default function EditGoalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-deep-bg" />}>
            <EditGoalContent />
        </Suspense>
    );
}
