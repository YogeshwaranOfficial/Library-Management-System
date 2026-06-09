export const CategoryTreeMap = ({ categories }: { categories: { name: string; value: number; color: string }[] }) => {
  const totalValue = categories.reduce((sum, c) => sum + c.value, 0) || 1;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">🏷️ Circulation Share by Genre</h3>
        <p className="text-xs text-gray-500">Live operational density mapping across catalog disciplines.</p>
      </div>
      <div className="flex w-full rounded-xl overflow-hidden h-14 border border-white shadow-inner my-2">
        {categories.map((cat) => (
          <div 
            key={cat.name} className={`${cat.color} h-full transition-all group relative cursor-pointer border-r border-white last:border-0`}
            style={{ width: `${(cat.value / totalValue) * 100}%` }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`} />
            <span className="text-xs font-medium text-gray-600 truncate">{cat.name} ({cat.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};