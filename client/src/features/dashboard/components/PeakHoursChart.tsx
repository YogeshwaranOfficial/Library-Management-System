export const PeakHoursChart = ({ data }: { data: { day: string; count: number }[] }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <div>
<h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">📈 Foot-Traffic Velocity</h3>        <p className="text-xs text-gray-500">Weekly checkout frequencies by operational calendar days.</p>
      </div>
      <div className="flex items-end justify-between h-36 pt-4 px-2">
        {data.map((item) => (
          <div key={item.day} className="flex flex-col items-center gap-2 group w-full">
            <div className="text-[10px] font-bold text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.count}
            </div>
            <div 
              className="w-8 bg-teal-500 rounded-t-md group-hover:bg-teal-600 transition-all cursor-pointer"
              style={{ height: `${(item.count / maxCount) * 100}px` }}
            />
            <span className="text-xs text-gray-500 font-medium">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};