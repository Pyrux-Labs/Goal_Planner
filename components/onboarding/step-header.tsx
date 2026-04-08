import { ReactNode } from "react";

interface StepHeaderProps {
    title: string | ReactNode;
    description: string;
}

const StepHeader = ({ title, description }: StepHeaderProps) => {
    return (
        <div className="py-4 px-2 md:px-4 mt-4 md:mt-6 mb-4 md:mb-6">
            <h1 className="text-white-pearl font-title font-bold text-3xl md:text-5xl lg:text-6xl mb-3 md:mb-4 leading-tight md:leading-normal">
                {title}
            </h1>
            <p className="text-input-text font-text text-base md:text-lg">
                {description}
            </p>
        </div>
    );
};

export default StepHeader;
