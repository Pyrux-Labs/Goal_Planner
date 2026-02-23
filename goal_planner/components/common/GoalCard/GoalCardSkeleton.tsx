export default function GoalCardSkeleton() {
    return (
        <div className="max-w-[70rem] w-full rounded-3xl border border-input-bg bg-modal-bg my-2 mx-auto">
            {/* Header Row */}
            <div className="h-24 flex flex-row items-center gap-6 p-6">
                {/* Icon Badge skeleton */}
                <div className="loading-skeleton w-14 h-14 rounded-2xl" />

                {/* Title and Description skeleton */}
                <div className="flex-1 max-w-md space-y-2">
                    <div className="loading-skeleton h-6 w-48 rounded" />
                    <div className="loading-skeleton h-4 w-64 rounded" />
                </div>

                {/* Progress section skeleton */}
                <div className="w-64 mr-8 space-y-2">
                    <div className="flex justify-between">
                        <div className="loading-skeleton h-4 w-16 rounded" />
                        <div className="loading-skeleton h-4 w-10 rounded" />
                    </div>
                    <div className="loading-skeleton h-2 w-full rounded-full" />
                </div>

                {/* Target Date skeleton */}
                <div className="flex flex-col items-end mr-8 space-y-1">
                    <div className="loading-skeleton h-3 w-12 rounded" />
                    <div className="loading-skeleton h-4 w-20 rounded" />
                </div>

                {/* Dropdown skeleton */}
                <div className="loading-skeleton w-6 h-6 rounded" />
            </div>
        </div>
    );
}
