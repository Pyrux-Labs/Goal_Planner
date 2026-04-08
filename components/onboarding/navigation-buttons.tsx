import { ArrowLeft, ArrowRight } from "lucide-react";
import Button from "@/components/ui/button";

interface NavigationButtonsProps {
    onPrevious?: () => void;
    onNext?: () => void;
    nextLabel?: string;
    nextHref?: string;
    showPrevious?: boolean;
    containerClassName?: string;
    hasNavbar?: boolean;
}

const NavigationButtons = ({
    onPrevious,
    onNext,
    nextLabel = "Continue",
    nextHref,
    showPrevious = true,
    containerClassName = "mx-4 md:mx-12 lg:mx-28 px-4",
    hasNavbar = false,
}: NavigationButtonsProps) => {
    return (
        <footer
            className={`fixed ${hasNavbar ? "bottom-16 md:bottom-0" : "bottom-0"} left-0 right-0 z-10 border-input-bg border bg-deep-bg py-4 md:py-6`}
        >
            <div
                className={`flex ${showPrevious && onPrevious ? "justify-between" : "justify-end"} items-center ${containerClassName}`}
            >
                {showPrevious && onPrevious && (
                    <button
                        onClick={onPrevious}
                        className="flex items-center gap-2 text-white-pearl w-52 h-16"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                )}

                <Button
                    href={nextHref}
                    onClick={onNext}
                    className="flex items-center justify-center w-52 h-16 gap-5 font-semibold"
                >
                    {nextLabel}
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </footer>
    );
};

export default NavigationButtons;
