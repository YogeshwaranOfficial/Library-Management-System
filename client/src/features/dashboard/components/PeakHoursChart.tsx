// Editorial Visual Assets
import { TrendingUp } from "lucide-react";

export const PeakHoursChart = ({
  data,
}: {
  data: { day: string; count: number }[];
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-left font-sans select-none">
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#718096] flex items-center gap-1.5">
          <TrendingUp size={14} className="text-[#718096]" /> Foot-Traffic
          Velocity
        </h3>
        <p className="text-xs text-[#718096] mt-1 leading-relaxed font-medium">
          Weekly checkout frequencies by operational calendar days.
        </p>
      </div>

      {/* Bar graph container track */}
      <div className="flex items-end justify-between h-40 pt-6 px-2 bg-slate-50 border border-gray-200 rounded-xl">
        {data.map((item) => (
          <div
            key={item.day}
            className="flex flex-col items-center gap-2 group w-full"
          >
            {/* Pop up data floating label indicator */}
            <div className="text-[10px] font-mono font-bold text-[#1A365D] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:-translate-y-0.5 pointer-events-none">
              {item.count}
            </div>

            {/* Interactive column block chart visualization */}
            <div
              className="w-8 bg-[#1A365D] rounded-t-md hover:bg-[#1A365D]/90 transition-all duration-200 cursor-pointer shadow-xs"
              style={{ height: `${(item.count / maxCount) * 110}px` }}
            />

            <span className="text-xs text-[#718096] font-bold tracking-wide mt-1 pb-2">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};