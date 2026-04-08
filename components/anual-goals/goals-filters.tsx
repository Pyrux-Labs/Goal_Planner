const FILTERS = [
  { id: "all" as const, label: "All" },
  { id: "active" as const, label: "Active" },
  { id: "completed" as const, label: "Completed" },
  { id: "unassigned" as const, label: "Unassigned" },
] as const;

export type GoalFilterType = (typeof FILTERS)[number]["id"];

interface GoalsFiltersProps {
  selected: GoalFilterType;
  onChange: (filter: GoalFilterType) => void;
}

export default function GoalsFilters({ selected, onChange }: GoalsFiltersProps) {
  return (
    <div className="h-16 w-full font-medium text-white-pearl flex items-center px-4 md:px-6 gap-6 md:gap-10 my-6 md:my-8 border-b-2 pb-6 border-input-bg">
      {FILTERS.map((filter) => (
        <span
          key={filter.id}
          className={`cursor-pointer border-b-2 pb-1 transition-colors duration-200 ${
            selected === filter.id
              ? "text-vibrant-orange border-vibrant-orange"
              : "border-modal-bg hover:text-vibrant-orange hover:border-vibrant-orange"
          }`}
          onClick={() => onChange(filter.id)}>
          {filter.label}
        </span>
      ))}
    </div>
  );
}
