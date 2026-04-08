import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";

interface TopButton {
    text: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "primary" | "secondary";
    disabled?: boolean;
}

interface TopProps {
    title?: React.ReactNode;
    buttons?: TopButton[];
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
    onToday?: () => void;
    showNavigation?: boolean;
    onToggleWeek?: () => void;
    isWeekView?: boolean;
}

const Top = ({
    title,
    buttons,
    onPrevMonth,
    onNextMonth,
    onToday,
    showNavigation = false,
    onToggleWeek,
    isWeekView = false,
}: TopProps) => {
    return (
        <div className="flex items-center justify-between mb-4 md:mb-8">
            {/* Left Section */}
            <div className="flex items-center gap-1 md:gap-4 min-w-0 flex-1">
                {title && (
                    <h2
                        className="text-lg md:text-3xl w-[6.5rem] md:w-auto md:min-w-[17rem] font-bold font-title text-white-pearl whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0"
                        suppressHydrationWarning
                    >
                        {title}
                    </h2>
                )}

                {showNavigation && (
                    <div className="flex items-center gap-0.5 md:gap-2 flex-shrink-0">
                        <button
                            onClick={onPrevMonth}
                            className="w-7 h-7 md:w-10 md:h-10 rounded-full hover:bg-input-bg/50 flex items-center justify-center transition-colors text-white-pearl"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                            onClick={onNextMonth}
                            className="w-7 h-7 md:w-10 md:h-10 rounded-full hover:bg-input-bg/50 flex items-center justify-center transition-colors text-white-pearl"
                            aria-label="Next month"
                        >
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <Button
                            onClick={onToday}
                            className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm"
                        >
                            Today
                        </Button>
                        <Button
                            onClick={onToggleWeek}
                            className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm"
                        >
                            {isWeekView ? "Month" : "Week"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {buttons?.map(({ text, onClick, icon, variant, disabled }) =>
                    showNavigation ? (
                        /* Calendar mode: circular orange icon buttons on mobile, full buttons on desktop */
                        <span key={text}>
                            <button
                                onClick={onClick}
                                disabled={disabled}
                                className="md:hidden w-9 h-9 rounded-full bg-vibrant-orange flex items-center justify-center text-white-pearl shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                                aria-label={text}
                            >
                                {icon}
                            </button>
                            <Button
                                onClick={onClick}
                                disabled={disabled}
                                className={`hidden md:flex ${
                                    variant === "secondary"
                                        ? "bg-gray-500 hover:bg-gray-600"
                                        : "items-center gap-2"
                                }`}
                            >
                                {icon}
                                {text}
                            </Button>
                        </span>
                    ) : (
                        <Button
                            key={text}
                            onClick={onClick}
                            disabled={disabled}
                            className={
                                variant === "secondary"
                                    ? "bg-gray-500 hover:bg-gray-600"
                                    : "flex items-center gap-2"
                            }
                        >
                            {icon}
                            {text}
                        </Button>
                    ),
                )}
            </div>
        </div>
    );
};

export default Top;
