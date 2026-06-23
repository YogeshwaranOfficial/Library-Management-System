// Editorial Visual Assets
import { CalendarDays } from "lucide-react";

export const ReturnForecaster = ({
  forecast,
}: {
  forecast: { date: string; count: number }[];
}) => {
  const maxForecast = Math.max(...forecast.map((f) => f.count), 1);
  return (
    <div className="bg-white p-2 rounded-2xl space-y-4 text-left font-sans select-none">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <CalendarDays size={14} className="text-[#0066ff]" /> 7-Day
          </h3>
          <h4 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
            Return Flow Forecaster
          </h4>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Expected book return volumes to optimize intake shelf arrangements.
          </p>
        </div>
      </div>

      {/* Horizontal Data Progress Bars Distribution layout */}
      <div className="space-y-3 pt-1">
        {forecast.map((day) => (
          <div
            key={day.date}
            className="flex items-center gap-4 text-xs font-semibold"
          >
            <span className="w-16 text-slate-400 font-bold tracking-wide">
              {day.date}
            </span>

            {/* Horizontal progress channel tracks */}
            <div className="flex-1 bg-slate-50 h-2 rounded-lg overflow-hidden border border-gray-200/40">
              <div
                className="bg-[#2B6CB0] h-full rounded-lg transition-all duration-500 ease-out"
                style={{ width: `${(day.count / maxForecast) * 100}%` }}
              />
            </div>

            <span className="w-16 text-right  font-bold text-slate-400 shrink-0">
              {day.count} books
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
