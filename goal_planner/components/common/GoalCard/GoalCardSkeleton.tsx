export default function GoalCardSkeleton() {
    return (
        <div className="max-w-[70rem] w-full rounded-3xl border border-input-bg bg-modal-bg my-2 mx-auto">
            {/* Header Row */}
            <div className="h-auto md:h-24 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 p-4 md:p-6">
                {/* Icon Badge skeleton */}
                <div className="loading-skeleton w-10 h-10 md:w-14 md:h-14 rounded-2xl" />

                {/* Title and Description skeleton */}
                <div className="flex-1 max-w-md space-y-2 w-full">
                    <div className="loading-skeleton h-5 md:h-6 w-36 md:w-48 rounded" />
                    <div className="loading-skeleton h-3 md:h-4 w-48 md:w-64 rounded" />
                </div>

                {/* Progress section skeleton */}
                <div className="w-full md:w-64 md:mr-8 space-y-2">
                    <div className="flex justify-between">
                        <div className="loading-skeleton h-4 w-16 rounded" />
                        <div className="loading-skeleton h-4 w-10 rounded" />
                    </div>
                    <div className="loading-skeleton h-2 w-full rounded-full" />
                </div>

                {/* Target Date skeleton - hidden on mobile */}
                <div className="hidden md:flex flex-col items-end mr-8 space-y-1">
                    <div className="loading-skeleton h-3 w-12 rounded" />
                    <div className="loading-skeleton h-4 w-20 rounded" />
                </div>

                {/* Dropdown skeleton */}
                <div className="loading-skeleton w-6 h-6 rounded hidden md:block" />
            </div>
        </div>
    );
}
