import { ChevronLeft } from "lucide-react";

interface SidebarModalProps {
    title?: string;
    children: React.ReactNode;
    onClose?: () => void;
}

export default function SidebarModal({
    title = "",
    children,
    onClose,
}: SidebarModalProps) {
    return (
        <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:h-full md:w-64 lg:w-64 xl:w-72 2xl:w-80 z-50 border-l border-input-bg bg-deep-bg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pl-0  flex-shrink-0">
                <div
                    onClick={onClose}
                    className=" w-10 h-10 rounded-full transition-colors hover:bg-input-bg/50 cursor-pointer"
                >
                    <ChevronLeft
                        className="w-10 h-10 text-vibrant-orange transition-colors"
                        strokeWidth={2.5}
                    />
                </div>
                <h1 className="text-3xl font-semibold text-white flex-1">
                    {title}
                </h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-1 scrollbar-custom">
                {children}
            </div>
        </div>
    );
}
