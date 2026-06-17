// Editorial Visual Assets
import { Layers } from "lucide-react";

// 🎨 CORE ANCHOR MAP: Keeping dynamic classes safe from purge bundles
const tailwindColorSafelist: Record<string, string> = {
  "bg-teal-500": "bg-teal-500",
  "bg-blue-500": "bg-blue-500",
  "bg-indigo-500": "bg-indigo-500",
  "bg-amber-500": "bg-amber-500",
};

interface CategoryItem {
  name: string;
  value: number;
  color: string;
}

export const CategoryTreeMap = ({ categories }: { categories: CategoryItem[] }) => {
  const totalValue = categories.reduce((sum, c) => sum + c.value, 0) || 1;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between h-full text-left font-sans text-slate-800 select-none">
      
      {/* 👋 HIDDEN COMPILER HOOK: Prevents asset pruning */}
      <span className="hidden">{Object.keys(tailwindColorSafelist).length}</span>

      {/* HEADER BLOCK: Premium Swiss Editorial Hierarchy */}
      <div className="border-b border-slate-100 pb-3.5 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 font-mono">
          <Layers size={12} className="text-indigo-600" /> 
           Categories
        </h3>
        <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Top 4 categories
        </h4>
        <p className="text-xs font-normal text-slate-500 mt-0.5 leading-relaxed">
          Live proportional data mapping of highest segments across library.
        </p>
      </div>

      {/* SEGMENTED DENSITY FLOW BAR */}
      <div className="flex w-full rounded-xl overflow-hidden h-14 border border-slate-200 shadow-inner my-2 shrink-0 bg-slate-100 p-0.5 gap-0.5">
        {categories.map((cat) => {
          const itemPct = Math.round((cat.value / totalValue) * 100);
          return (
            <div
              key={cat.name}
              className={`${cat.color} h-full transition-all duration-200 group relative cursor-pointer first:rounded-l-lg last:rounded-r-lg`}
              style={{ width: `${(cat.value / totalValue) * 100}%` }}
            >
              {/* Overlay highlight */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              
              {/* Dynamic CSS Popover Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md whitespace-nowrap z-10">
                {cat.name}: {itemPct}% ({cat.value})
              </div>
            </div>
          );
        })}
      </div>

      {/* HIGH-CONTRAST LEGEND GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 mt-2 border-t border-dashed border-slate-100">
        {categories.map((cat) => {
          return (
            <div
              key={cat.name}
              className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 p-2 rounded-xl"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0 mt-1 ring-4 ring-white shadow-2xs`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate" title={cat.name}>
                  {cat.name}
                </span>
                <span className="text-[10px] font-bold font-mono text-slate-700 mt-0.5">
                  {cat.value.toLocaleString()} Books
                </span>
              </div>
            </div>
          );
        })}
      </div>

  

    </div>
  );
};