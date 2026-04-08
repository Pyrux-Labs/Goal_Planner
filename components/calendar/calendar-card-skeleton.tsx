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
                "w-full aspect-[1/2] md:aspect-[4/5] lg:w-32 lg:h-36 rounded-sm md:rounded-xl loading-skeleton flex-shrink-0",
                "border border-input-bg",
                isModalOpen ? "xl:w-32 2xl:w-32" : "xl:w-40 2xl:w-44",
            )}
        />
    );
}
