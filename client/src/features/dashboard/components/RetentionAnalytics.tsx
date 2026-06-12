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
    <div className="bg-card-bg p-6 rounded-2xl border border-border-main/60 shadow-xs flex flex-col justify-between min-h-65 text-left font-sans">
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-slate-500" /> Retention Lifetime
          Policy
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
          Average reading span before returning an item.
        </p>
      </div>

      {/* Hero Analytics Counter Callout */}
      <div className="text-center py-5 space-y-1">
        <div className="text-4xl font-bold text-text-main tracking-tight font-sans">
          {avg}{" "}
          <span className="text-xl font-semibold tracking-normal text-slate-400">
            Days
          </span>
        </div>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Average Book Lifecycle Span
        </p>
      </div>

      {/* Threshold Capacity Info block */}
      <div className="bg-slate-50/50 border border-border-main/60 p-3.5 rounded-xl text-center space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Current Hard Due Limit Threshold
        </p>
        <p className="text-xs font-bold text-text-main font-mono">
          {maxLimit} Days Authorized
        </p>
      </div>
    </div>
  );
};
