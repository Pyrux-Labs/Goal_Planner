import { BiSolidError } from "react-icons/bi";

interface ErrorMessageProps {
    message: string;
    variant?: "field" | "general";
    className?: string;
}

export default function ErrorMessage({
    message,
    variant = "field",
    className,
}: ErrorMessageProps) {
    if (variant === "general") {
        return (
            <div
                className={
                    className ?? "flex items-center gap-2 text-carmin text-sm"
                }
            >
                <BiSolidError className="text-lg" />
                <span>{message}</span>
            </div>
        );
    }

    return (
        <span
            className={
                className ?? "text-xs text-carmin flex items-center gap-1 mt-1"
            }
        >
            <BiSolidError />
            {message}
        </span>
    );
}
