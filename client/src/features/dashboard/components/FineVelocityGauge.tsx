// Editorial Visual Assets
import { Banknote, } from "lucide-react";

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
    <div className="bg-white p-2 rounded-2xl  flex flex-col justify-between h-full text-left font-sans select-none">
      
      {/* HEADER BLOCK: Standardized Institutional Hierarchy */}
      <div className="border-b border-slate-100 pb-3.5 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-mono">
          <Banknote size={12} className="text-emerald-600" /> 
           Fines
        </h3>
        <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Recovery Collection Velocity
        </h4>
        <p className="text-xs font-normal text-slate-500 mt-0.5 leading-relaxed">
          The structural clearance index of settled overdue account liabilities against outstanding book penalties.
        </p>
      </div>

      {/* CORE DISPLAY: High Contrast Numeric Layout & SVG Metric Ring */}
      <div className="flex items-center justify-between gap-6 flex-1 my-2">
        
        {/* Left Side: Numeric Value Readouts */}
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider font-mono block bg-emerald-50 px-2 py-0.5 rounded-md w-max border border-emerald-100/60">
              Collected Fines
            </span>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              ₹{collected.toLocaleString("en-IN")}
            </p>
          </div>
          
          <div className="pt-1 border-t border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-medium">
              Outstanding Fines:{" "}
              <span className="text-slate-900 font-bold ml-1">
                ₹{outstanding.toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Circular Gauge Ring Terminal */}
        <div className="relative flex items-center justify-center h-24 w-24 shrink-0 bg-slate-50 border border-slate-100 rounded-full shadow-2xs">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            {/* Base Background Track Line */}
            <path
              className="text-slate-200/70"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Reactive Quantitative Progress Overlay */}
            <path
              className="text-emerald-600 transition-all duration-700 ease-out"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          
          {/* Central Percentage Value Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-base font-black text-emerald-950 leading-none">
              {percentage}%
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Ratio
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};