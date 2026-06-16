// Editorial Visual Assets
import { Clock } from "lucide-react";

export const RetentionAnalytics = ({
  metrics,
}: {
  metrics?: { avgDays: number; threshold: number };
}) => {
  const avg = metrics?.avgDays || 12.4;
  const maxLimit = metrics?.threshold || 14;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between min-h-65 text-left font-sans select-none">
      <div>
        <h3 className="text-[11px] font-bold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-[#718096]" /> Retention Lifetime
          Policy
        </h3>
        <p className="text-xs text-[#718096] mt-1 leading-relaxed font-medium">
          Average reading span before returning an item.
        </p>
      </div>

      {/* Hero Analytics Counter Callout */}
      <div className="text-center py-5 space-y-1">
        <div className="text-4xl font-bold text-[#1A365D] tracking-tight font-sans">
          {avg}{" "}
          <span className="text-xl font-semibold tracking-normal text-[#718096]">
            Days
          </span>
        </div>
        <p className="text-xs font-bold text-[#2D3748] uppercase tracking-wide">
          Average Book Lifecycle Span
        </p>
      </div>

      {/* Threshold Capacity Info block */}
      <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-xl text-center space-y-1">
        <p className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
          Current Hard Due Limit Threshold
        </p>
        <p className="text-xs font-bold text-[#1A365D] font-mono">
          {maxLimit} Days Authorized
        </p>
      </div>
    </div>
  );
};