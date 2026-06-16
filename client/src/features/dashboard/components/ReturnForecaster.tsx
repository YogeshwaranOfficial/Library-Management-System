// Editorial Visual Assets
import { CalendarDays } from "lucide-react";

export const ReturnForecaster = ({
  forecast,
}: {
  forecast: { date: string; count: number }[];
}) => {
  const maxForecast = Math.max(...forecast.map((f) => f.count), 1);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 text-left font-sans select-none">
      <div>
        <h3 className="text-[11px] font-bold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays size={14} className="text-[#718096]" /> 7-Day Return
          Flow Forecaster
        </h3>
        <p className="text-xs text-[#718096] mt-1 leading-relaxed font-medium">
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
            <span className="w-16 text-[#718096] font-bold tracking-wide">
              {day.date}
            </span>

            {/* Horizontal progress channel tracks */}
            <div className="flex-1 bg-slate-50 h-2 rounded-lg overflow-hidden border border-gray-200/40">
              <div
                className="bg-[#1A365D] h-full rounded-lg transition-all duration-500 ease-out"
                style={{ width: `${(day.count / maxForecast) * 100}%` }}
              />
            </div>

            <span className="w-16 text-right font-mono font-bold text-[#1A365D] shrink-0">
              {day.count} items
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};