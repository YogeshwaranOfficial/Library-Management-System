// Editorial Visual Assets
import { PieChart } from "lucide-react";

// 🎨 CORE ANCHOR MAP: Kept private (no export) so Vite Fast Refresh stays happy
const tailwindColorSafelist: Record<string, string> = {
  "bg-teal-500": "bg-teal-500",
  "bg-blue-500": "bg-blue-500",
  "bg-indigo-500": "bg-indigo-500",
  "bg-amber-500": "bg-amber-500",
};

export const CategoryTreeMap = ({
  categories,
}: {
  categories: { name: string; value: number; color: string }[];
}) => {
  const totalValue = categories.reduce((sum, c) => sum + c.value, 0) || 1;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4 h-full flex flex-col justify-between text-left font-sans text-[#2D3748] select-none">
      
      {/* 👋 HIDDEN COMPILER HOOK: Satisfies TS / ESLint "unused variable" rules */}
      <span className="hidden">{Object.keys(tailwindColorSafelist).length}</span>

      <div>
        <h3 className="text-[11px] font-bold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
          <PieChart size={12} className="text-[#718096]" /> Circulation Share by Genre
        </h3>
        <p className="text-xs text-[#718096] mt-1 leading-relaxed font-medium">
          Live operational density mapping across catalog disciplines.
        </p>
      </div>

      {/* Structured Distribution Density Bar */}
      <div className="flex w-full rounded-xl overflow-hidden h-14 border border-gray-200 shadow-inner my-2 shrink-0 bg-slate-50">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`${cat.color} h-full transition-all duration-200 group relative cursor-pointer border-r border-slate-50/40 last:border-0`}
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
          <div
            key={cat.name}
            className="flex items-center gap-2 overflow-hidden"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0 ring-4 ring-white`}
            />
            <span className="text-xs font-semibold text-[#1A365D] truncate">
              {cat.name}{" "}
              <span className="text-[#718096] font-mono font-bold text-[11px]">
                ({cat.value})
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};