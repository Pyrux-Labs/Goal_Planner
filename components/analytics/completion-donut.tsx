/**
 * Completion donut chart for tasks or habits.
 * compact=true → sidebar (reduced size)
 * compact=false → /stats (full size)
 */

interface CompletionDonutProps {
    label: string;
    completed: number;
    total: number;
    color: string;
    compact: boolean;
}

export default function CompletionDonut({
    label,
    completed,
    total,
    color,
    compact,
}: CompletionDonutProps) {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const size = compact ? 96 : 140;
    const strokeWidth = compact ? 11 : 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = total === 0 ? circumference : circumference - (pct / 100) * circumference;
    const center = size / 2;

    const displayColor = total === 0 ? "hsl(215, 20%, 65%)" : color;

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    {/* Track */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="none" stroke="hsl(13, 23%, 19%)" strokeWidth={strokeWidth}
                    />
                    {/* Progress */}
                    <circle
                        cx={center} cy={center} r={radius}
                        fill="none" stroke={displayColor} strokeWidth={strokeWidth}
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                </svg>
                {/* Center label */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className={`font-bold font-title leading-none ${compact ? "text-base" : "text-xl"}`}
                        style={{ color: displayColor }}
                    >
                        {pct}%
                    </span>
                </div>
            </div>

            {/* Text below */}
            <span className={`font-medium text-white-pearl ${compact ? "text-xs" : "text-sm"}`}>
                {label}
            </span>
            <span className={`text-input-text ${compact ? "text-[0.65rem]" : "text-xs"}`}>
                {completed} of {total} completed
            </span>
        </div>
    );
}
