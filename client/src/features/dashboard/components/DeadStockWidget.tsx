// Editorial Visual Assets
import { Archive } from "lucide-react";

interface DeadBook {
  id: string;
  title: string;
  shelf: string;
}

export const DeadStockWidget = ({ items }: { items: DeadBook[] }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between min-h-65 text-left font-sans select-none">
    <div>
      <h3 className="text-[11px] font-bold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
        <Archive size={14} className="text-[#718096]" /> Relocation "Dead Stock"
      </h3>
      <p className="text-xs text-[#718096] mt-1 leading-relaxed font-medium">
        Inventory titles with zero checkouts over the past 6 months.
      </p>
    </div>

    <div className="space-y-2.5 my-4 overflow-y-auto max-h-35 pr-1 flex-1">
      {items.length === 0 ? (
        <p className="text-xs text-[#718096]/60 italic py-6 text-center font-medium">
          All assets show healthy conversion rates.
        </p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-slate-50 border border-gray-200 p-2.5 rounded-xl transition-colors"
          >
            <span
              className="text-xs font-bold text-[#2D3748] truncate max-w-35 sm:max-w-42.5"
              title={item.title}
            >
              {item.title}
            </span>
            {/* <span className="text-[10px] font-mono font-bold bg-slate-100 border border-border-main/60 px-2 py-0.5 rounded-md text-slate-600 uppercase tracking-wide">
              Shelf: {item.shelf}
            </span> */}
          </div>
        ))
      )}
    </div>

    {/* <button className="w-full py-2.5 border border-border-main text-text-main bg-card-bg hover:bg-slate-50 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer shadow-xs">
      Optimize Warehouse Storage
    </button> */}
  </div>
);