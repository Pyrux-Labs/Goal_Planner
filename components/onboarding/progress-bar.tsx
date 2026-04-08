interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
    stepLabel: string;
}

const ProgressBar = ({
    currentStep,
    totalSteps,
    stepLabel,
}: ProgressBarProps) => {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <header className="px-6 md:px-24 pt-4">
            <div className="flex justify-between mb-1">
                <div className="text-vibrant-orange text-xs font-bold tracking-wide">
                    STEP {currentStep} OF {totalSteps}
                </div>
                <div className="text-input-text text-xs font-bold tracking-wide">
                    {stepLabel}
                </div>
            </div>
            <div className="h-2 bg-progress-empty rounded-full">
                <div
                    className="h-2 bg-vibrant-orange rounded-full bg-main-gradient transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </header>
    );
};

export default ProgressBar;
