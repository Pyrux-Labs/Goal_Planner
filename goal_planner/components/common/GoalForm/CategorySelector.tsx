import Image from "next/image";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import { categories } from "@/lib/constants/categories";

interface CategorySelectorProps {
	selected: string;
	onSelect: (name: string) => void;
	error?: string;
	disabled?: boolean;
}

export default function CategorySelector({
	selected,
	onSelect,
	error,
	disabled,
}: CategorySelectorProps) {
	return (
		<div className="mb-8">
			<label className="block text-white-pearl mb-4">SELECT CATEGORY</label>
			<div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-0 justify-items-center">
				{categories.map((category) => (
					<button
						key={category.name}
						onClick={() => onSelect(category.name)}
						disabled={disabled}
						className={`relative h-16 w-16 md:h-24 md:w-24 flex items-center justify-center rounded-2xl md:rounded-3xl transition-all ${
							selected === category.name
								? "bg-vibrant-orange shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)]"
								: "bg-input-bg hover:shadow-[0px_0px_10px_2px_rgba(217,78,6,0.8)]"
						} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
						<div className="absolute top-[38%] -translate-y-1/2">
							<Image
								src={category.icon}
								alt={category.name}
								width={36}
								height={36}
								className={`w-5 h-5 md:w-9 md:h-9 object-contain transition-colors ${
									selected === category.name ? "filter brightness-0 invert" : ""
								}`}
							/>
						</div>
						<span className="absolute bottom-1 md:bottom-3 text-[10px] md:text-xs text-white-pearl">
							{category.name}
						</span>
					</button>
				))}
			</div>
			{error && (
				<ErrorMessage
					message={error}
					className="text-xs text-carmin flex items-center gap-1 mt-2"
				/>
			)}
		</div>
	);
}
