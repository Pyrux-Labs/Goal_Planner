interface GoalsStatisticsBarProps {
  activeCount: number;
  completedCount: number;
  overallProgress: number;
}

export default function GoalsStatisticsBar({
  activeCount,
  completedCount,
  overallProgress,
}: GoalsStatisticsBarProps) {
  return (
    <div className="h-auto md:h-14 w-full bg-modal-bg border font-medium text-white-pearl border-input-bg rounded-3xl flex flex-col md:flex-row items-start md:items-center px-4 md:px-6 py-3 md:py-0 gap-2 md:gap-10">
      <div className="flex items-center gap-3 md:gap-10 flex-shrink-0">
        <span>{activeCount} Active</span>
        <span className="hidden md:inline">|</span>
        <span>{completedCount} Completed</span>
      </div>
      <span className="hidden md:inline flex-shrink-0">|</span>
      <div className="flex items-center gap-3 w-full md:flex-1 min-w-0">
        <span className="text-sm md:text-base flex-shrink-0">
          Year Progress:
          <span className="text-vibrant-orange"> {overallProgress}%</span>
        </span>
        <div className="flex-1 min-w-[80px] h-2 bg-input-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-vibrant-orange transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
