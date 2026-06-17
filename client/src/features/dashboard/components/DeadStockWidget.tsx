// Editorial Visual Assets
import { Archive } from "lucide-react";

interface DeadBook {
  id: string;
  title: string;
  shelf: string;
}

export const DeadStockWidget = ({ items }: { items: DeadBook[] }) => {
  return (
    <div className="bg-white p-2 rounded-2xl flex flex-col justify-start h-full text-left font-sans select-none">
      
      {/* HEADER BLOCK: Distinct editorial hierarchies */}
      <div className="border-b border-slate-100 pb-3.5 mb-4">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 py-0.5">
          <Archive size={12} className="text-amber-600" /> 
          Inventory
        </h3>
        <h4 className="text-lg font-black text-slate-900 tracking-tight mt-1">
          Relocation "Dead Stock"
        </h4>
        <p className="text-xs font-normal text-slate-500 mt-0.5 leading-relaxed">
          Inventory titles with zero checkouts over the past 6 months targeted for archive storage.
        </p>
      </div>

      {/* COMPACT SCROLLABLE TERMINAL CONTAINER */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 flex-1 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-xs text-slate-400 italic font-medium">
              All physical assets show active checkout circulation.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl hover:bg-slate-100/70 transition-colors gap-3"
            >
              {/* Left Side: Bold Title */}
              <span
                className="text-xs font-bold text-slate-800 truncate flex-1"
                title={item.title}
              >
                {item.title}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
};