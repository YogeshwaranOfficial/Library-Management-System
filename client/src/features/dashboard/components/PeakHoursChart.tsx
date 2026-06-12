// Editorial Visual Assets
import { TrendingUp } from "lucide-react";

export const PeakHoursChart = ({
  data,
}: {
  data: { day: string; count: number }[];
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-card-bg p-6 rounded-2xl border border-border-main/60 shadow-xs space-y-4 text-left font-sans">
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-slate-500" /> Foot-Traffic
          Velocity
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
          Weekly checkout frequencies by operational calendar days.
        </p>
      </div>

      {/* Bar graph container track */}
      <div className="flex items-end justify-between h-40 pt-6 px-2 bg-slate-50/40 border border-slate-100 rounded-xl">
        {data.map((item) => (
          <div
            key={item.day}
            className="flex flex-col items-center gap-2 group w-full"
          >
            {/* Pop up data floating label indicator */}
            <div className="text-[10px] font-mono font-bold text-text-main bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:-translate-y-0.5 pointer-events-none">
              {item.count}
            </div>

            {/* Interactive column block chart visualization */}
            <div
              className="w-8 bg-slate-900 rounded-t-md group-hover:bg-slate-800 transition-all duration-200 cursor-pointer shadow-xs"
              style={{ height: `${(item.count / maxCount) * 110}px` }}
            />

            <span className="text-xs text-slate-500 font-bold tracking-wide mt-1 pb-2">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
