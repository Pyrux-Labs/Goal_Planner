import { colors } from "@/lib/constants/categories";

interface ColorPickerProps {
	selected: string;
	onSelect: (color: string) => void;
	disabled?: boolean;
}

export default function ColorPicker({
	selected,
	onSelect,
	disabled,
}: ColorPickerProps) {
	return (
		<div>
			<label className="block text-white-pearl mb-4">COLOR TAG</label>
			<div className="flex items-center gap-2 w-full h-12">
				{colors.map((color) => (
					<button
						key={color}
						onClick={() => onSelect(color)}
						disabled={disabled}
						className={`w-6 h-6 rounded-full transition-all ${
							selected === color ? "scale-110" : "hover:scale-110"
						} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
						style={{
							backgroundColor: color,
							boxShadow:
								selected === color ? `0 0 10px 2px ${color}80` : "none",
						}}
					/>
				))}
			</div>
		</div>
	);
}
