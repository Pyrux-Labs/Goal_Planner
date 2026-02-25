import { BiSolidError } from "react-icons/bi";

interface ErrorMessageProps {
    message: string;
    variant?: "field" | "general" | "block";
    className?: string;
}

export default function ErrorMessage({
    message,
    variant = "field",
    className,
}: ErrorMessageProps) {
    if (variant === "block") {
        return (
            <div
                className={
                    className ??
                    "flex items-center gap-2 text-carmin text-base bg-carmin/10 border border-carmin rounded-2xl p-4"
                }
            >
                <BiSolidError className="text-xl flex-shrink-0" />
                <span>{message}</span>
            </div>
        );
    }

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
