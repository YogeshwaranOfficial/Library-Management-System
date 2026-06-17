// Editorial Visual Assets
import { TrendingUp } from "lucide-react";

export const PeakHoursChart = ({
  data,
}: {
  data: { day: string; count: number }[];
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const peakDayItem = [...data].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="bg-white p-2 rounded-2xl flex flex-col justify-between h-full text-left font-sans select-none">
      
      {/* Header Block with strong weight contrast */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-blue-600" /> 
             Operational Metrics
          </h3>
          <h4 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Foot-Traffic Velocity
          </h4>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Weekly checkout frequencies by operational calendar days.
          </p>
        </div>
        
        {/* Peak Status Badge - Clear functional color departure */}
        {peakDayItem && peakDayItem.count > 0 && (
          <div className="hidden sm:block">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
              Peak Day: {peakDayItem.day}
            </span>
          </div>
        )}
      </div>

      {/* Bar Chart Section */}
      <div className="relative flex items-end justify-between h-40 pt-8 px-4 bg-slate-50 border border-slate-300 rounded-xl gap-1 mt-4">
        
        {/* Background reference tracks */}
        <div className="absolute inset-x-0 bottom-12 border-t border-slate-200/40 pointer-events-none border-dashed" />
        <div className="absolute inset-x-0 bottom-24 border-t border-slate-200/40 pointer-events-none border-dashed" />
        
        {data.map((item) => {
          const isPeak = item.count === peakDayItem?.count && item.count > 0;
          
          return (
            <div key={item.day} className="flex flex-col items-center group w-full relative z-10 h-full justify-end">
              
              {/* High Contrast Tooltip popup indicator */}
              <div className="absolute -top-1 text-[10px] font-mono font-bold text-white bg-slate-900 px-1.5 py-0.5 rounded opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none shadow-sm mb-1">
                {item.count}
              </div>

              {/* Data Column Layout */}
              <div
                className={`w-full max-w-7 transition-all duration-200 cursor-pointer rounded-t-sm shadow-2xs
                  ${isPeak 
                    ? 'bg-blue-900 hover:bg-slate-900' 
                    : item.count === 0 
                      ? 'bg-slate-200/70' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                style={{ height: item.count === 0 ? '3px' : `${(item.count / maxCount) * 105}px` }}
              />

              {/* Day Label with conditional size/weight based on activity */}
              <span className={`text-[10px] font-mono mt-2 uppercase tracking-wider
                ${isPeak ? 'text-slate-900 font-bold' : 'text-slate-400 font-medium'}`}>
                {item.day.slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};