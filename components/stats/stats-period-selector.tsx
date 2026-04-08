import type { AnalyticsPeriod } from "@/hooks/use-analytics-data";

const PERIODS: { id: AnalyticsPeriod; label: string }[] = [
  { id: "weekly", label: "This week" },
  { id: "monthly", label: "This month" },
  { id: "all", label: "All time" },
];

interface StatsPeriodSelectorProps {
  selected: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

export default function StatsPeriodSelector({ selected, onChange }: StatsPeriodSelectorProps) {
  return (
    <div className="flex gap-6 md:gap-10 border-b-2 border-input-bg pb-4 mb-6 md:mb-8 font-medium text-white-pearl">
      {PERIODS.map(({ id, label }) => (
        <span
          key={id}
          onClick={() => onChange(id)}
          className={`cursor-pointer border-b-2 pb-1 transition-colors duration-200 ${
            selected === id
              ? "text-vibrant-orange border-vibrant-orange"
              : "border-transparent hover:text-vibrant-orange hover:border-vibrant-orange"
          }`}>
          {label}
        </span>
      ))}
    </div>
  );
}
