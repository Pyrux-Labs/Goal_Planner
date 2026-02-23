import { cn } from "@/lib/utils";

interface CalendarCardSkeletonProps {
    isModalOpen?: boolean;
}

export default function CalendarCardSkeleton({
    isModalOpen = true,
}: CalendarCardSkeletonProps) {
    return (
        <div
            className={cn(
                "w-28 h-32 lg:w-32 lg:h-36 rounded-xl loading-skeleton flex-shrink-0",
                "border border-input-bg",
                isModalOpen ? "xl:w-32 2xl:w-32" : "xl:w-40 2xl:w-44",
            )}
        />
    );
}
