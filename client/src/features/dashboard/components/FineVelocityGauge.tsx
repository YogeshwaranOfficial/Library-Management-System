export const FineVelocityGauge = ({
  collected,
  outstanding,
}: {
  collected: number;
  outstanding: number;
}) => {
  const total = collected + outstanding || 1;
  const percentage = Math.round((collected / total) * 100);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-4 text-left font-sans select-none">
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
          Recovery Collection Velocity
        </h3>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-[#1A365D] tracking-tight">
            ₹{collected} Recovered
          </p>
          <p className="text-xs text-[#718096] font-semibold">
            Remaining Outstanding:{" "}
            <span className="text-[#2D3748] font-mono">₹{outstanding}</span>
          </p>
        </div>
      </div>

      {/* Editorial Velocity Circular Gauge */}
      <div className="relative flex items-center justify-center h-24 w-24 shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Base track channel layout */}
          <path
            className="text-slate-100"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Reactive quantitative value progress track layer */}
          <path
            className="text-[#1A365D]"
            strokeDasharray={`${percentage}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-sm font-mono font-bold text-[#1A365D]">
          {percentage}%
        </span>
      </div>
    </div>
  );
};