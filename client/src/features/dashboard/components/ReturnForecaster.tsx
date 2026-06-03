export const ReturnForecaster = ({ forecast }: { forecast: { date: string; count: number }[] }) => {
  const maxForecast = Math.max(...forecast.map(f => f.count), 1);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">📅 7-Day Return Flow Forecaster</h3>
        <p className="text-xs text-gray-500">Expected book return volumes to optimize intake shelf arrangements.</p>
      </div>
      <div className="space-y-2">
        {forecast.map((day) => (
          <div key={day.date} className="flex items-center gap-4 text-xs">
            <span className="w-16 text-gray-500 font-semibold">{day.date}</span>
            <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(day.count / maxForecast) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right font-bold text-gray-800">{day.count} items</span>
          </div>
        ))}
      </div>
    </div>
  );
};