// Editorial Visual Assets
import { PieChart } from "lucide-react";

export const CategoryTreeMap = ({ categories }: { categories: { name: string; value: number; color: string }[] }) => {
  const totalValue = categories.reduce((sum, c) => sum + c.value, 0) || 1;
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-xs space-y-4 h-full flex flex-col justify-between text-left font-sans">
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <PieChart size={12} className="text-slate-500" /> Circulation Share by Genre
        </h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
          Live operational density mapping across catalog disciplines.
        </p>
      </div>

      {/* Structured Distribution Density Bar */}
      <div className="flex w-full rounded-xl overflow-hidden h-14 border border-white shadow-inner my-2 shrink-0 bg-slate-50">
        {categories.map((cat) => (
          <div 
            key={cat.name} 
            className={`${cat.color} h-full transition-all duration-200 group relative cursor-pointer border-r border-white/40 last:border-0`}
            style={{ width: `${(cat.value / totalValue) * 100}%` }}
          >
            {/* Subtle overlay tracking on interactive cell selection */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Categorical Color Mapping Grid Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-2 overflow-hidden">
            <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0 ring-4 ring-slate-50`} />
            <span className="text-xs font-semibold text-slate-600 truncate">
              {cat.name} <span className="text-slate-400 font-mono font-bold text-[11px]">({cat.value})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};