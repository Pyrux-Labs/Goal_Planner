import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../ui/Button/Button";

interface TopButton {
	text: string;
	onClick: () => void;
	icon?: React.ReactNode;
	variant?: "primary" | "secondary";
	disabled?: boolean;
}

interface TopProps {
	title?: string;
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
		<div className="flex items-center justify-between mb-8">
			{/* Left Section */}
			<div className="flex items-center gap-4">
				{title && (
					<h2 className="text-3xl min-w-[17rem] font-bold font-title text-white-pearl">
						{title}
					</h2>
				)}

				{showNavigation && (
					<div className="flex items-center gap-2">
						<button
							onClick={onPrevMonth}
							className="w-10 h-10 rounded-full hover:bg-input-bg/50 flex items-center justify-center transition-colors text-white-pearl"
							aria-label="Previous month">
							<ChevronLeft className="w-5 h-5" />
						</button>
						<button
							onClick={onNextMonth}
							className="w-10 h-10 rounded-full hover:bg-input-bg/50 flex items-center justify-center transition-colors text-white-pearl"
							aria-label="Next month">
							<ChevronRight className="w-5 h-5" />
						</button>
						<Button onClick={onToday} className="px-4 py-2">
							Today
						</Button>
						<Button onClick={onToggleWeek} className="px-4 py-2">
							{isWeekView ? "Month" : "Week"}
						</Button>
					</div>
				)}
			</div>

			{/* Right Section */}
			<div className="flex items-center gap-2">
				{buttons?.map(({ text, onClick, icon, variant, disabled }) => (
					<Button
						key={text}
						onClick={onClick}
						disabled={disabled}
						className={
							variant === "secondary"
								? "bg-gray-500 hover:bg-gray-600"
								: "flex items-center gap-2"
						}>
						{icon}
						{text}
					</Button>
				))}
			</div>
		</div>
	);
};

export default Top;
