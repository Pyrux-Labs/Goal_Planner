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
		<div className="fixed right-0 top-0 h-full w-80 lg:w-64 xl:w-72 2xl:w-80 z-50 border-l border-input-bg bg-deep-bg">
			{/* Header */}
			<div className="flex items-center justify-between mb-8 p-6 border-b border-input-bg">
				<div
					onClick={onClose}
					className="group relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-input-bg/50 cursor-pointer">
					<ChevronLeft
						className="w-6 h-6 text-vibrant-orange transition-colors"
						strokeWidth={2.5}
					/>
				</div>
				<h1 className="text-2xl font-bold text-white flex-1">{title}</h1>
			</div>

			{/* Content */}
			<div className="h-full overflow-y-auto p-6">{children}</div>
		</div>
	);
}
