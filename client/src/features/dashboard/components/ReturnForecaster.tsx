// Editorial Visual Assets
import { CalendarDays } from "lucide-react";

export const ReturnForecaster = ({
  forecast,
}: {
  forecast: { date: string; count: number }[];
}) => {
  const maxForecast = Math.max(...forecast.map((f) => f.count), 1);
  return (
    <div className="bg-card-bg p-6 rounded-2xl border border-border-main/60 shadow-xs space-y-4 text-left font-sans">
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays size={14} className="text-slate-500" /> 7-Day Return
          Flow Forecaster
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
          Expected book return volumes to optimize intake shelf arrangements.
        </p>
      </div>

      {/* Horizontal Data Progress Bars Distribution layout */}
      <div className="space-y-3 pt-1">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="flex items-center gap-4 text-xs font-semibold"
          >
            <span className="w-16 text-slate-500 font-bold tracking-wide">
              {day.date}
            </span>

            {/* Horizontal progress channel tracks */}
            <div className="flex-1 bg-slate-100 h-2 rounded-lg overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-lg transition-all duration-500 ease-out"
                style={{ width: `${(day.count / maxForecast) * 100}%` }}
              />
            </div>

            <span className="w-16 text-right font-mono font-bold text-text-main shrink-0">
              {day.count} items
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
