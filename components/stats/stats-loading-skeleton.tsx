export default function StatsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-modal-bg border border-input-bg rounded-3xl p-6 h-28 animate-pulse"
        />
      ))}
    </div>
  );
}
