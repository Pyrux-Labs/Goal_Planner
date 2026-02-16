import { ReactNode } from "react";

interface ModalProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl";
}

const Modal = ({
	title,
	subtitle,
	children,
	className = "",
	maxWidth = "lg",
}: ModalProps) => {
	// Max width mappings
	const maxWidthClasses = {
		sm: "max-w-[25rem]",
		md: "max-w-[31.25rem]",
		lg: "max-w-[34.375rem]",
		xl: "max-w-[37.5rem]",
	};

	const modalClassName = `${maxWidthClasses[maxWidth]} bg-modal-bg rounded-3xl border-[3px] border-vibrant-orange shadow-lg shadow-vibrant-orange/50 px-14 pt-10 pb-8 ${className}`;

	return (
		<div className={modalClassName}>
			{/* Header */}
			<div className="flex flex-col mb-6 text-center">
				<h1 className="text-white-pearl font-title text-4xl font-semibold mb-4">
					{title}
				</h1>
				{subtitle && (
					<p className="text-white-pearl/80 text-base">{subtitle}</p>
				)}
			</div>

			{/* Content */}
			<div className="space-y-6">{children}</div>
		</div>
	);
};

export default Modal;
