export const RetentionAnalytics = ({ metrics }: { metrics?: { avgDays: number; threshold: number } }) => {
  const avg = metrics?.avgDays || 12.4;
  const maxLimit = metrics?.threshold || 14;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between min-h-65">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">⏳ Retention Lifetime Policy</h3>
        <p className="text-xs text-gray-500 mt-0.5">Average reading span before returning an item.</p>
      </div>
      <div className="text-center py-4 space-y-1">
        <div className="text-4xl font-black text-indigo-600 tracking-tight">{avg} Days</div>
        <p className="text-xs font-bold text-gray-700">Average Book Lifecycle Span</p>
      </div>
      <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl text-center space-y-1">
        <p className="text-[11px] font-medium text-gray-500">Current Hard Due Limit Threshold</p>
        <p className="text-xs font-bold text-gray-900">{maxLimit} Days Authorized</p>
      </div>
    </div>
  );
};