// Editorial Visual Assets
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export const RetentionAnalytics = ({
  metrics,
}: {
  metrics?: { avgDays: number; threshold: number };
}) => {
  const avg = metrics?.avgDays || 12.4;
  const maxLimit = metrics?.threshold || 14;
  const percentageUsed = Math.min((avg / maxLimit) * 100, 100);
  const isCloseToThreshold = percentageUsed > 85;

  return (
    <div className="bg-white p-2 rounded-2xl flex flex-col justify-start h-full text-left font-sans select-none">
      {/* HEADER BLOCK: Distinct label hierarchies */}
      <div>
        <div className="flex items-center justify-between">
          {/* Status Label - High color distinction based on state */}
          {isCloseToThreshold ? (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md">
              <ShieldAlert size={10} /> At Risk
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 py-0.5 rounded-md">
              <CheckCircle2 size={10} className="text-emerald-500" />
              Optimal
            </span>
          )}
        </div>

        <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Retention Lifetime
        </h4>
        <p className="text-xs font-normal text-slate-400 mt-0.5 leading-normal">
          Average reading span before a book is returned.
        </p>
      </div>

      {/* HERO METRIC DISPLAY: Maximum typographic contrast */}
      <div className="py-3 my-2 border-y border-slate-100 flex flex-col items-baseline justify-between">
        <div>
          <span className="text-5xl font-black text-slate-900 tracking-tighter block">
            {avg}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest  block mt-1">
            Average Due Days
          </span>
        </div>

        <div className="text-left mt-10">
          <span className="text-xl font-bold text-slate-800 tracking-tight block">
            {maxLimit} Days
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest  block mt-1">
            Maximum Due days
          </span>
        </div>
      </div>

      {/* GAUGE TRACK: Pure visual utility indicator */}
      {/* <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-500 font-medium">Lending Window Allocation</span>
          <span className={` font-bold ${isCloseToThreshold ? "text-amber-600" : "text-blue-900"}`}>
            {percentageUsed.toFixed(0)}% Exhausted
          </span>
        </div>
        
        <div className="w-full h-2 bg-slate-150 rounded-full overflow-hidden p-1px bg-slate-100 border border-slate-200/30">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isCloseToThreshold ? 'bg-amber-500' : 'bg-slate-900'
            }`}
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div> */}

      {/* LOGISTICAL ACTION FOOTER: Strong dark layout block shift */}
      {/* <div className={`mt-5 p-3 rounded-xl flex items-center gap-3 border ${
        isCloseToThreshold 
          ? 'bg-amber-50/50 border-amber-100 text-amber-900' 
          : 'bg-slate-50 border-slate-100 text-slate-800'
      }`}>
        <Clock size={16} className={isCloseToThreshold ? "text-amber-600" : "text-slate-400"} />
        <p className="text-[11px] font-medium leading-tight">
          {isCloseToThreshold 
            ? "Recommendation: Trigger system queue warning notifications immediately."
            : "System parameters are operating within safe baseline margin thresholds."
          }
        </p>
      </div> */}
    </div>
  );
};
