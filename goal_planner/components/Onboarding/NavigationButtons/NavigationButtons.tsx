import { TfiArrowLeft, TfiArrowRight } from "react-icons/tfi";
import Button from "@/components/ui/Button/Button";

interface NavigationButtonsProps {
    onPrevious?: () => void;
    onNext?: () => void;
    nextLabel?: string;
    nextHref?: string;
    showPrevious?: boolean;
    containerClassName?: string;
}

const NavigationButtons = ({
    onPrevious,
    onNext,
    nextLabel = "Continue",
    nextHref,
    showPrevious = true,
    containerClassName = "mx-4 md:mx-12 lg:mx-28 px-4",
}: NavigationButtonsProps) => {
    return (
        <footer className="fixed bottom-16 md:bottom-0 left-0 right-0 z-10 border-input-bg border bg-deep-bg py-4 md:py-6">
            <div
                className={`flex ${showPrevious && onPrevious ? "justify-between" : "justify-end"} items-center ${containerClassName}`}
            >
                {showPrevious && onPrevious && (
                    <button
                        onClick={onPrevious}
                        className="flex items-center gap-2 text-white-pearl w-52 h-16"
                    >
                        <TfiArrowLeft />
                        <span>Back</span>
                    </button>
                )}

                <Button
                    href={nextHref}
                    onClick={onNext}
                    className="flex items-center justify-center w-52 h-16 gap-5 font-semibold"
                >
                    {nextLabel}
                    <TfiArrowRight />
                </Button>
            </div>
        </footer>
    );
};

export default NavigationButtons;
