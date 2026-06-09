export const FineVelocityGauge = ({ collected, outstanding }: { collected: number; outstanding: number }) => {
  const total = collected + outstanding || 1;
  const percentage = Math.round((collected / total) * 100);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">💰 Recovery Collection Velocity</h3>
        <div className="space-y-0.5">
          <p className="text-2xl font-black text-gray-900">₹{collected} Recovered</p>
          <p className="text-xs text-gray-400 font-medium">Remaining Outstanding: ₹{outstanding}</p>
        </div>
      </div>
      <div className="relative flex items-center justify-center h-24 w-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className="text-amber-500" strokeDasharray={`${percentage}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <span className="absolute text-sm font-bold text-gray-800">{percentage}%</span>
      </div>
    </div>
  );
};